const fs = require('fs');

let keysToBeRemoved = [];

function flattenObject(obj, parentKey = '', result = {}) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Add current path to keysToBeRemoved before recursing
        keysToBeRemoved.push(newKey);
        // Recursively flatten nested objects
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

// Read and process dict.json
try {
  const rawData = fs.readFileSync('dict.json', 'utf8');
  const data = JSON.parse(rawData);
  
  // Reset keysToBeRemoved array
  keysToBeRemoved = [];
  
  const flattened = flattenObject(data);
  
  // Write keysToBeRemoved to JSON file
  fs.writeFileSync('keysToBeRemoved.json', JSON.stringify(keysToBeRemoved, null, 2));
  
  // Write flattened object to JSON file
  fs.writeFileSync('flattened_dict.json', JSON.stringify(flattened, null, 2));
  
  console.log('Successfully generated:');
  console.log('1. keysToBeRemoved.json');
  console.log('2. flattened_dict.json');
  
} catch (error) {
  console.error('Error processing files:', error.message);
}