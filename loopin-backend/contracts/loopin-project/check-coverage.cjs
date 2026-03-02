const fs = require('fs');

const lcov = fs.readFileSync('lcov.info', 'utf-8');
const linesArr = lcov.split('\n');

const lineHits = {};

for (const line of linesArr) {
    if (line.startsWith('DA:')) {
        const parts = line.substring(3).split(',');
        const lineNum = parts[0];
        const hits = parseInt(parts[1]);
        if (!lineHits[lineNum]) lineHits[lineNum] = 0;
        lineHits[lineNum] += hits;
    }
}

let lf = 0, lh = 0;
const missed = [];
for (const lineNum in lineHits) {
    lf++;
    if (lineHits[lineNum] > 0) {
        lh++;
    } else {
        missed.push(lineNum);
    }
}

console.log(`Lines: ${lh}/${lf} (${lf === 0 ? 100 : (lh / lf * 100).toFixed(2)}%)`);
console.log(`Missed Lines: ${missed.join(', ')}`);
