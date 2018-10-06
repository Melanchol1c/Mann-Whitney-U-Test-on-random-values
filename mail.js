// The object key used to store the observation value.
let __key = 'val';

// Rank the list.
let rank = (list) => {

    // First, sort in ascending order
    list.sort((a, b) => a[__key] - b[__key])

    // Second, add the rank to the objects
    list = list.map((item, index) => {
        item.rank = index + 1;
        return item;
    });

    // Third, use median values for groups with the same rank
    for (let i = 0; i < list.length;) {
        let count = 1;
        let total = list[i].rank;

        for (let j = 0; list[i + j + 1] && (list[i + j][__key] === list[i + j + 1][__key]); j++) {
            total += list[i + j + 1].rank;
            count++;
        }

        let rank = (total / count);

        for (let k = 0; k < count; k++) {
            list[i + k].rank = rank;
        }

        i = i + count;
    }

    console.log(list)

    return list;
};

// Compute the rank of a sample, given a ranked
// list and a list of observations for that sample.
let sampleRank = (rankedList, observations) => {

    // Clone the array
    let __observations = observations.slice(0);

    // Compute the rank
    let rank = 0;
    rankedList.forEach((observation) => {
        let index = __observations.indexOf(observation[__key]);
        if (index > -1) {
            // Add the rank to the sum
            rank += observation.rank;

            // Remove the observation from the list
            __observations.splice(index, 1);
        }
    });

    return rank;
};

// Compute the U value of a sample,
// given the rank and the list of observations
// for that sample.
let uValue = (rank, observations) => {
    let k = observations.length;
    return rank - ((k * (k + 1)) / 2);
};

// Check the U values are valid.
// This utilises a property of the Mann-Whitney U test
// that ensures the sum of the U values equals the product
// of the number of observations.
let check = (u, samples) => {
    console.log(`${u[0]} + ${u[1]} == ${samples[0].length} * ${samples[1].length}`,
        (u[0] + u[1]) == (samples[0].length * samples[1].length))
    return (u[0] + u[1]) == (samples[0].length * samples[1].length);
};

var criticalValue = function (u, samples) {
    var uVal = Math.min(u[0], u[1]);
    // var prod = samples[0].length * samples[1].length;
    let m = samples[0].length
    let n = samples[1].length
    let s = m + n

    // // Count the ranks
    var counts = {};
    samples.forEach(function (sample) {
        sample.forEach(function (o) {
            if (!counts[o]) counts[o] = 1;
            else counts[o]++;
        });
    });

    // Find any tied ranks
    var ties = Object.keys(counts)
        .filter(function (key) {
            return counts[key] > 1
        })
        .map(function (tie) {
            return counts[tie]
        });
    var k = ties.length;

    // Compute correction
    var tSum = 0;
    for (var i = 0; i < k; i++) {
        tSum += (Math.pow(ties[i], 3) - ties[i]);
    }


    let z = (Math.abs(uVal - ((m * n) / 2))) /
        (Math.sqrt(((m * n) / (s * (s - 1))) * ((Math.pow(s, 3) - s) / 12) - tSum / 12))


    return z;
};


let methodCheck = (u) => {
    zCrit = 1.645;
    console.log(`U1 = ${u[0]}`)
    console.log(`U2 = ${u[1]}`)
    console.log(`Z = ${criticalValue(u, samples)}`)
    console.log(`Zкрит = ${zCrit}`)
    console.log(`${criticalValue(u, samples)} < ${zCrit} ?`)
    return (criticalValue(u, samples) < zCrit);
};

let test = (samples) => {

    // Perform validation
    if (!Array.isArray(samples)) throw Error('Samples must be an array');
    if (samples.length !== 2) throw Error('Samples must contain exactly two samples');

    for (let i = 0; i < 2; i++) {
        if (!samples[i] || samples[i].length == 0) throw Error('Samples cannot be empty');
        if (!Array.isArray(samples[i])) throw Error('Sample ' + i + ' must be an array');
    }

    // Rank the entire list of observations
    let all = samples[0].concat(samples[1]);

    let unranked = all.map((val) => {
        let result = {};
        result[__key] = val;
        return result;
    });

    let ranked = rank(unranked);

    // Compute the rank of each sample
    let ranks = [];
    for (let i = 0; i < 2; i++) {
        ranks[i] = sampleRank(ranked, samples[i]);
    }

    // Compute the U values
    let us = [];
    for (let i = 0; i < 2; i++) {
        us[i] = uValue(ranks[i], samples[i]);
    }

    // Return the array of U values
    return us;
};



let n = [];
let m = [];

let getRndInteger = (min, max) => Math.floor(Math.random() * (max - min)) + min;

for (let i = 0; i < 20; i++) {
    let num = getRndInteger(20, 40);
    n = [...n, num];
}

for (let i = 0; i < 20; i++) {
    let num = getRndInteger(20, 40);
    m = [...m, num];
}

let samples = [n, m];

console.log("n =", ...samples[0])
console.log("m =", ...samples[1])

let U = test(samples);

check(U, samples);

methodCheck(U, samples) ? console.log('Гипотеза подтверждается') :
    console.log('Гипотеза не подтверждается')