/* -------------------------------------------------
   1️⃣  Table definition (recreated without pg_get_tabledef)
   ------------------------------------------------- */
WITH cols AS (
  SELECT
    a.attnum,
    a.attname        AS column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
    NOT a.attnotnull AS is_nullable,
    pg_get_expr(ad.adbin, ad.adrelid) AS column_default
  FROM pg_attribute a
  JOIN pg_class c   ON a.attrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
  WHERE n.nspname = 'public'
    AND c.relname = 'user_subscriptions'
    AND a.attnum > 0
    AND NOT a.attisdropped
  ORDER BY a.attnum
),
pk AS (
  SELECT con.conname,
         ARRAY_AGG(col.attname ORDER BY col.attnum) AS pk_cols
  FROM pg_constraint con
  JOIN pg_class c       ON con.conrelid = c.oid
  JOIN pg_namespace n   ON c.relnamespace = n.oid
  JOIN pg_attribute col ON col.attrelid = c.oid AND col.attnum = ANY(con.conkey)
  WHERE n.nspname = 'public'
    AND c.relname = 'user_subscriptions'
    AND con.contype = 'p'
  GROUP BY con.conname
)
SELECT
  'CREATE TABLE public.user_subscriptions (' || chr(10) ||
  string_agg(
    '    ' || column_name || ' ' || data_type ||
    CASE
      WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
      ELSE ''
    END ||
    CASE
      WHEN NOT is_nullable THEN ' NOT NULL'
      ELSE ''
    END,
    ',' || chr(10)
  ) ||
  CASE
    WHEN pk.pk_cols IS NOT NULL THEN
      ',' || chr(10) || '    CONSTRAINT ' || pk.conname || ' PRIMARY KEY (' ||
      array_to_string(pk.pk_cols, ', ') || ')'
    ELSE ''
  END ||
  chr(10) || ');' AS table_definition
FROM cols
LEFT JOIN pk ON true
GROUP BY pk.conname, pk.pk_cols;

/* -------------------------------------------------
   2️⃣  Constraints (PK, FK, UNIQUE, CHECK, EXCLUDE)
   ------------------------------------------------- */
SELECT
    con.conname               AS constraint_name,
    CASE con.contype
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'c' THEN 'CHECK'
        WHEN 'x' THEN 'EXCLUDE'
        ELSE con.contype::text
    END                       AS constraint_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class      c  ON con.conrelid = c.oid
JOIN pg_namespace  n  ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'user_subscriptions';

/* -------------------------------------------------
   3️⃣  Indexes (including primary‑key indexes)
   ------------------------------------------------- */
SELECT
    n.nspname       AS schema_name,
    idx_class.relname AS index_name,
    pg_get_indexdef(idx_class.oid) AS definition,
    idx.indisunique AS is_unique,
    ARRAY_AGG(col.attname ORDER BY idx_col.attnum) AS index_columns
FROM pg_index idx
JOIN pg_class idx_class ON idx.indexrelid = idx_class.oid
JOIN pg_class tbl_class ON idx.indrelid = tbl_class.oid
JOIN pg_namespace n ON tbl_class.relnamespace = n.oid
JOIN pg_attribute col ON col.attrelid = tbl_class.oid 
JOIN LATERAL unnest(idx.indkey) WITH ORDINALITY AS idx_col(attnum, ord) ON col.attnum = idx_col.attnum
WHERE n.nspname = 'public'
  AND tbl_class.relname = 'user_subscriptions'
GROUP BY n.nspname, idx_class.relname, idx_class.oid, idx.indisunique
ORDER BY idx_class.relname;

/* -------------------------------------------------
   4️⃣  Triggers + the functions they execute
   ------------------------------------------------- */
WITH tbl AS (
    SELECT c.oid AS tbl_oid
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND c.relname = 'user_subscriptions'
)
SELECT
    tg.tgname                     AS trigger_name,
    CASE
        WHEN tg.tgtype & 2 <> 0 THEN 'BEFORE'
        WHEN tg.tgtype & 64 <> 0 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END                           AS timing,
    string_agg(
        CASE
            WHEN tg.tgtype & 4 <> 0 THEN 'INSERT'
            WHEN tg.tgtype & 8 <> 0 THEN 'DELETE'
            WHEN tg.tgtype & 16 <> 0 THEN 'UPDATE'
            WHEN tg.tgtype & 32 <> 0 THEN 'TRUNCATE'
        END,
        ' OR '
    )                             AS event,
    pg_get_triggerdef(tg.oid)     AS trigger_definition,
    n.nspname                     AS function_schema,
    p.proname                     AS function_name,
    pg_get_functiondef(p.oid)     AS function_definition
FROM pg_trigger tg
JOIN pg_proc    p ON tg.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN tbl t     ON tg.tgrelid = t.tbl_oid
WHERE NOT tg.tgisinternal      -- ignore internal system triggers
GROUP BY tg.tgname, tg.tgtype, tg.oid, n.nspname, p.proname, p.oid
ORDER BY trigger_name;