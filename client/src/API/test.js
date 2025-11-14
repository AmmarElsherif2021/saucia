import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const schemaData = require('./model.json');

function generateDatabaseDocumentation(schemaData) {
    let markdown = `# Database Schema Documentation\n*Generated on: ${new Date().toLocaleString()}*\n\n## Table of Contents\n`;

    const tables = [...new Set(schemaData.map(item => item.table_name))];
    tables.forEach(table => markdown += `- [${table}](#${table.toLowerCase()})\n`);
    markdown += '\n';

    const tableGroups = {};
    schemaData.forEach(item => {
        if (!tableGroups[item.table_name]) tableGroups[item.table_name] = [];
        tableGroups[item.table_name].push(item);
    });

    Object.entries(tableGroups).forEach(([tableName, items]) => {
        markdown += `## ${tableName}\n\n`;
        items.sort((a, b) => a.sort_order - b.sort_order);

        items.forEach(item => {
            const output = item.output.trim();
            
            if (output.includes('CREATE TABLE Definition')) {
                markdown += `### Table Definition\n\`\`\`sql\n${extractSQLContent(output)}\n\`\`\`\n\n`;
            } 
            else if (output.includes('Constraints')) {
                markdown += `### Constraints\n`;
                extractListItems(output).forEach(constraint => {
                    markdown += `- **${constraint.type}**: ${constraint.name}\n  \`\`\`sql\n  ${constraint.definition}\n  \`\`\`\n`;
                });
                markdown += '\n';
            }
            else if (output.includes('Indexes')) {
                markdown += `### Indexes\n`;
                extractListItems(output).forEach(index => {
                    markdown += `- **${index.type}**: ${index.name}\n  - Columns: ${index.columns}\n  - Definition: \`\`\`sql\n    ${index.definition}\n    \`\`\`\n`;
                });
                markdown += '\n';
            }
            else if (output.includes('Triggers & Function Definitions')) {
                markdown += `### Triggers & Functions\n`;
                extractTriggers(output).forEach(trigger => {
                    markdown += `#### 🔥 ${trigger.name}\n- **Timing**: ${trigger.timing}\n- **Events**: ${trigger.events}\n- **Function**: ${trigger.function}\n\n**Trigger Definition**:\n\`\`\`sql\n${trigger.triggerDefinition}\n\`\`\`\n\n**Function Definition**:\n\`\`\`sql\n${trigger.functionDefinition}\n\`\`\`\n`;
                });
            }
        });
        markdown += '---\n\n';
    });

    return markdown;
}

function extractSQLContent(output) {
    const lines = output.split('\n');
    let sqlContent = '';
    let inSQL = false;
    
    for (const line of lines) {
        if (line.includes('CREATE TABLE') || line.includes('CREATE OR REPLACE FUNCTION')) inSQL = true;
        if (inSQL) sqlContent += line + '\n';
        if (line.trim() === '' && inSQL) break;
    }
    return sqlContent.trim();
}

function extractListItems(output) {
    const items = [];
    const lines = output.split('\n');
    let currentItem = null;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('•')) {
            if (currentItem) items.push(currentItem);
            const match = trimmedLine.match(/•\s+([^(]+)\s+\(([^)]+)\)/);
            if (match) currentItem = { name: match[1].trim(), type: match[2].trim(), definition: '' };
        } 
        else if (currentItem && trimmedLine && !trimmedLine.startsWith('---')) {
            if (trimmedLine.startsWith('Columns:')) currentItem.columns = trimmedLine.replace('Columns:', '').trim();
            else if (trimmedLine.startsWith('Definition:')) currentItem.definition = trimmedLine.replace('Definition:', '').trim();
            else currentItem.definition += (currentItem.definition ? ' ' : '') + trimmedLine;
        }
    }
    if (currentItem) items.push(currentItem);
    return items;
}

function extractTriggers(output) {
    const triggers = [];
    const sections = output.split('---\n\n');
    
    sections.forEach(section => {
        const lines = section.split('\n');
        const trigger = { name: '', timing: '', events: '', function: '', triggerDefinition: '', functionDefinition: '' };
        let currentSection = '';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('🔥 TRIGGER:')) trigger.name = trimmedLine.replace('🔥 TRIGGER:', '').trim();
            else if (trimmedLine.startsWith('Timing:')) trigger.timing = trimmedLine.replace('Timing:', '').trim();
            else if (trimmedLine.startsWith('Events:')) trigger.events = trimmedLine.replace('Events:', '').trim();
            else if (trimmedLine.startsWith('Function:')) trigger.function = trimmedLine.replace('Function:', '').trim();
            else if (trimmedLine.startsWith('📋 Trigger Definition:')) currentSection = 'trigger';
            else if (trimmedLine.startsWith('⚙️  Function Definition:')) currentSection = 'function';
            else if (trimmedLine.startsWith('CREATE TRIGGER') || trimmedLine.startsWith('CREATE OR REPLACE FUNCTION')) {
                if (currentSection === 'trigger') trigger.triggerDefinition += line + '\n';
                else if (currentSection === 'function') trigger.functionDefinition += line + '\n';
            }
            else if (currentSection && trimmedLine) {
                if (currentSection === 'trigger') trigger.triggerDefinition += line + '\n';
                else if (currentSection === 'function') trigger.functionDefinition += line + '\n';
            }
        }
        if (trigger.name) triggers.push(trigger);
    });
    return triggers;
}

function saveToMarkdownFile(markdownContent, filename = 'database-documentation.md') {
    fs.writeFileSync(filename, markdownContent);
    //console.log(`Documentation saved to ${filename}`);
}

const markdown = generateDatabaseDocumentation(schemaData);
saveToMarkdownFile(markdown);