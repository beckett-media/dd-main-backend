const roughScale = (x, base) => {
    const parsed = parseInt(x, base);
    if (isNaN(parsed)) { return 0; }
    return parsed;
}

const compsMapper = {
    'A+': {
        'PSA': '9-10',
        'BGS': '9-10',
        'SGC': '9-10'
    },
    'A': {
        'PSA': '8-9',
        'BGS': '8-9',
        'SGC': '8-9'
    },
    'B+': {
        'PSA': '7-8',
        'BGS': '7-8',
        'SGC': '7-8'
    },
    'B': {
        'PSA': '6-7',
        'BGS': '6-7',
        'SGC': '6-7'
    },
    'C+': {
        'PSA': '5-6',
        'BGS': '5-6',
        'SGC': '5-6'
    },
    'C': {
        'PSA': '4-5',
        'BGS': '4-5',
        'SGC': '4-5'
    },
    'D+': {
        'PSA': '3-4',
        'BGS': '3-4',
        'SGC': '3-4'
    },
    'D': {
        'PSA': '2-3',
        'BGS': '2-3',
        'SGC': '2-3'
    },
    'F+': {
        'PSA': '1-2',
        'BGS': '1-2',
        'SGC': '1-2'
    },
    'F': {
        'PSA': '1',
        'BGS': '1',
        'SGC': '1'
    }
}

const getGrade = (val) => {
    if (val > 9 && val <= 10) return 'A+';
    if (val > 8 && val <= 9) return 'A';
    if (val > 7 && val <= 8) return 'B+';
    if (val > 6 && val <= 7) return 'B';
    if (val > 5 && val <= 6) return 'C+';
    if (val > 4 && val <= 5) return 'C';
    if (val > 3 && val <= 4) return 'D+';
    if (val > 2 && val <= 3) return 'D';
    if (val > 1 && val <= 2) return 'F+';
    if (val > 0 && val <= 1) return 'F';
}

const scoreMapper = {
    'A+': 10,
    'A': 9,
    'B+': 8,
    'B': 7,
    'C+': 6,
    'C': 5,
    'D+': 4,
    'D': 3,
    'F+': 2,
    'F': 1
}

const checkIfExist = (val) => {
    return val ? val : 0;
}

const centerGradeAvg = (centering) => {
    const { letter_grade = '' } = centering;
    return {
        compare: scoreMapper[letter_grade] ? true : false,
        val: scoreMapper[letter_grade] ? scoreMapper[letter_grade] : 0
    }
}

const cornerGradeAvg = (corners) => {
    const { bottom_left = '', bottom_right = '', top_left = '', top_right = '' } = corners;
    const bottomLeftScore = scoreMapper[bottom_left];
    const bottomRightScore = scoreMapper[bottom_right];
    const topLeftScore = scoreMapper[top_left];
    const topRightScore = scoreMapper[top_right];
    let count = 0;
    if (bottomLeftScore) count++;
    if (bottomRightScore) count++;
    if (topLeftScore) count++;
    if (topRightScore) count++;
    const total = checkIfExist(bottomLeftScore) + checkIfExist(bottomRightScore) + checkIfExist(topLeftScore) + checkIfExist(topRightScore); 
    return {
        compare: count > 0,
        val: count > 0 ? (total/count) : 0
    }
}

const edgeGradeAvg = (edges) => {
    const { bottom = '', left = '', right = '', top = '' } = edges;
    const bottomScore = scoreMapper[bottom];
    const leftScore = scoreMapper[left];
    const rightScore = scoreMapper[right];
    const topScore = scoreMapper[top];
    let count = 0;
    if (bottomScore) count++;
    if (leftScore) count++;
    if (rightScore) count++;
    if (topScore) count++;
    const total = checkIfExist(bottomScore) + checkIfExist(leftScore) + checkIfExist(rightScore) + checkIfExist(topScore); 
    return {
        compare: count > 0,
        val: count > 0 ? (total/count) : 0
    }
}

const surfaceGradeAvg = (surface) => {
    const { surface_grade = '' } = surface;
    return {
        compare: scoreMapper[surface_grade] ? true : false,
        val: scoreMapper[surface_grade] ? scoreMapper[surface_grade] : 0
    }
}

const totalGradeAvg = (grading) => {
    const { centering = {}, corners = {}, edges = {}, surface = {} } = grading;
    const centerGrade = centerGradeAvg(centering);
    const cornerGrade = cornerGradeAvg(corners);
    const edgeGrade = edgeGradeAvg(edges);
    const surfaceGrade = surfaceGradeAvg(surface);
    let count = 0;
    if (centerGrade.compare) count++;
    if (cornerGrade.compare) count++;
    if (edgeGrade.compare) count++;
    if (surfaceGrade.compare) count++;
    const avgVal = (centerGrade.val + cornerGrade.val + edgeGrade.val + surfaceGrade.val)/count;
    const overallGrade = getGrade(avgVal);
    const gradingComps = compsMapper[overallGrade];
    return {
        overallGrade,
        gradingComps
    }
}

module.exports = {
    roughScale, totalGradeAvg
};
