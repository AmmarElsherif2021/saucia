import { Money } from "../../../../supabase/functions/_shared/server-bundle.mjs"

Deno.serve(() => {
  const ten = Money.fromDollars(10);
  const two = Money.fromDollars(2);
  const result = ten.subtract(two);

  return Response.json({
    imported: true,
    amountInCents: result.inCents,
    amountInDollars: result.inDollars,
    rendered: result.toString(),
  });
});