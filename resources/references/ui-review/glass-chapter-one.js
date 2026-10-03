import { applyUndergroundBoards } from './glass-underground.js';
import { applyLateBoards } from './glass-late-boards.js';
import { applyMiddleBoards } from './glass-middle-boards.js';
// Authored chapter-one levels. Stable IDs preserve saved progress.
export const redesignedLevels = [
  {
    "id": 31,
    "displayNumber": 1,
    "chapter": 1,
    "name": "Первый свет",
    "tutorial": true,
    "timeLimitSeconds": 25,
    "hintTutorial": false,
    "readyCoach": true,
    "houseEntryGap": true,
    "completionStars": 3,
    "nextLevelId": 32,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      5,
      0,
      1,
      6,
      7,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        6,
        7,
        8,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "S"
      ],
      [
        2
      ],
      [
        3
      ],
      [
        4
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "N",
        "E"
      ],
      [
        7,
        "W",
        "E"
      ],
      [
        8,
        "W",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11
      ],
      [
        12
      ],
      [
        13
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15
      ],
      [
        16
      ],
      [
        17
      ],
      [
        18
      ],
      [
        19
      ],
      [
        20
      ],
      [
        21
      ],
      [
        22
      ],
      [
        23
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      2,
      3,
      0,
      0,
      0,
      0,
      3,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          4,
          4,
          0,
          0,
          0,
          0,
          4,
          0,
          0,
          4,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          7,
          8,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            7,
            8,
            9,
            14
          ]
        ],
        "actions": [
          0,
          0,
          1,
          6,
          9,
          9
        ]
      }
    ],
    "hintsEnabled": false
  },
  {
    "id": 32,
    "displayNumber": 2,
    "chapter": 1,
    "name": "Первый обход",
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": true,
    "houseEntryGap": true,
    "completionStars": 3,
    "nextLevelId": 33,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      11,
      6,
      7,
      12,
      13,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        11,
        6,
        7,
        12,
        13,
        8,
        9,
        14
      ]
    ],
    "solution": [
      [
        0
      ],
      [
        1,
        "N",
        "E"
      ],
      [
        2
      ],
      [
        3,
        "W",
        "E"
      ],
      [
        4
      ],
      [
        5
      ],
      [
        6,
        "S",
        "E"
      ],
      [
        7,
        "W",
        "S"
      ],
      [
        8,
        "S",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "E"
      ],
      [
        11,
        "W",
        "N"
      ],
      [
        12,
        "N",
        "E"
      ],
      [
        13,
        "W",
        "N"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15
      ],
      [
        16,
        "S",
        "E"
      ],
      [
        17
      ],
      [
        18,
        "E",
        "S"
      ],
      [
        19
      ],
      [
        20
      ],
      [
        21
      ],
      [
        22,
        "W",
        "E"
      ],
      [
        23
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      0,
      0,
      0,
      0,
      0,
      0,
      3,
      2,
      3,
      3,
      0,
      3,
      3,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "path": [
          10,
          11,
          6,
          7,
          12,
          13,
          8,
          9,
          14
        ],
        "paths": [
          [
            10,
            11,
            6,
            7,
            12,
            13,
            8,
            9,
            14
          ]
        ],
        "actions": [
          11,
          6,
          7,
          7,
          12,
          13,
          13,
          8,
          9
        ]
      }
    ],
    "hintsEnabled": false
  },
  {
    "id": 33,
    "displayNumber": 3,
    "chapter": 1,
    "name": "Ложная дорожка",
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": false,
    "houseEntryGap": false,
    "completionStars": 3,
    "nextLevelId": 34,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      15,
      20,
      21,
      22,
      17,
      12,
      11,
      6,
      1,
      2,
      3,
      8,
      13,
      18,
      19,
      14
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        22,
        17,
        12,
        11,
        6,
        1,
        2,
        3,
        8,
        13,
        18,
        19,
        14
      ]
    ],
    "solution": [
      [
        0,
        "N",
        "E"
      ],
      [
        1,
        "S",
        "E"
      ],
      [
        2,
        "W",
        "E"
      ],
      [
        3,
        "W",
        "S"
      ],
      [
        4,
        "N",
        "E"
      ],
      [
        5,
        "N",
        "S"
      ],
      [
        6,
        "S",
        "N"
      ],
      [
        7,
        "N",
        "E"
      ],
      [
        8,
        "N",
        "S"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "E",
        "N"
      ],
      [
        12,
        "S",
        "W"
      ],
      [
        13,
        "N",
        "S"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "N",
        "E"
      ],
      [
        17,
        "S",
        "N"
      ],
      [
        18,
        "N",
        "E"
      ],
      [
        19,
        "W",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23,
        "N",
        "S"
      ],
      [
        24,
        "N",
        "S"
      ]
    ],
    "initialRotations": [
      1,
      1,
      1,
      2,
      2,
      0,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      3,
      1,
      2,
      1,
      3,
      0,
      3,
      1,
      3,
      1,
      3
    ],
    "variants": [
      {
        "stars": 1,
        "rotations": [
          1,
          4,
          2,
          4,
          2,
          0,
          0,
          1,
          2,
          0,
          4,
          0,
          0,
          2,
          4,
          2,
          2,
          2,
          4,
          0,
          4,
          2,
          4,
          1,
          3
        ],
        "path": [
          10,
          15,
          20,
          21,
          22,
          17,
          12,
          11,
          6,
          1,
          2,
          3,
          8,
          13,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            22,
            17,
            12,
            11,
            6,
            1,
            2,
            3,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "actions": [
          10,
          10,
          10,
          15,
          20,
          21,
          22,
          17,
          1,
          1,
          1,
          2,
          3,
          3,
          8,
          13,
          18,
          14
        ]
      }
    ],
    "hintsEnabled": false,
    "timeLimitSeconds": 45
  },
  {
    "id": 34,
    "displayNumber": 4,
    "chapter": 1,
    "name": "Змейка через двор",
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": false,
    "houseEntryGap": false,
    "completionStars": 3,
    "nextLevelId": 35,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [10, 5, 0, 1, 2, 7, 6, 11, 16, 21, 22, 23, 24, 19, 18, 17, 12, 13, 8, 3, 4, 9, 14],
    "paths": [
      [10, 5, 0, 1, 2, 7, 6, 11, 16, 21, 22, 23, 24, 19, 18, 17, 12, 13, 8, 3, 4, 9, 14]
    ],
    "solution": [
      [0, "S", "E"],
      [1, "W", "E"],
      [2, "W", "S"],
      [3, "S", "E"],
      [4, "W", "S"],
      [5, "S", "N"],
      [6, "E", "S"],
      [7, "N", "W"],
      [8, "S", "N"],
      [9, "N", "S"],
      [10, "W", "N"],
      [11, "N", "S"],
      [12, "S", "E"],
      [13, "W", "N"],
      [14, "N", "E"],
      [15, "N", "S"],
      [16, "N", "S"],
      [17, "E", "N"],
      [18, "E", "W"],
      [19, "S", "W"],
      [20, "N", "S"],
      [21, "N", "E"],
      [22, "W", "E"],
      [23, "W", "E"],
      [24, "W", "N"]
    ],
    "initialRotations": [3, 1, 2, 2, 3, 1, 3, 1, 1, 1, 3, 1, 1, 3, 1, 0, 1, 0, 0, 1, 0, 2, 1, 1, 3],
    "variants": [
      {
        "stars": 1,
        "rotations": [4, 2, 4, 4, 4, 2, 4, 4, 2, 2, 4, 2, 4, 4, 4, 0, 2, 0, 0, 4, 0, 4, 2, 2, 4],
        "path": [10, 5, 0, 1, 2, 7, 6, 11, 16, 21, 22, 23, 24, 19, 18, 17, 12, 13, 8, 3, 4, 9, 14],
        "paths": [
          [10, 5, 0, 1, 2, 7, 6, 11, 16, 21, 22, 23, 24, 19, 18, 17, 12, 13, 8, 3, 4, 9, 14]
        ],
        "actions": [10, 5, 0, 1, 2, 2, 7, 7, 7, 6, 11, 16, 21, 21, 22, 23, 24, 19, 19, 19, 12, 12, 12, 13, 8, 3, 3, 4, 9, 14, 14, 14]
      }
    ],
    "hintsEnabled": false
  },
  {
    "id": 36,
    "displayNumber": 6,
    "chapter": 1,
    "name": "Лишний поворот",
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": false,
    "houseEntryGap": false,
    "completionStars": 3,
    "nextLevelId": 37,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      5,
      0,
      1,
      6,
      11,
      12,
      17,
      18,
      13,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        6,
        11,
        12,
        17,
        18,
        13,
        8,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "S"
      ],
      [
        2,
        "N",
        "S"
      ],
      [
        3
      ],
      [
        4
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "N",
        "S"
      ],
      [
        7
      ],
      [
        8,
        "S",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "N",
        "E"
      ],
      [
        12,
        "W",
        "S"
      ],
      [
        13,
        "S",
        "N"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15
      ],
      [
        16,
        "N",
        "E"
      ],
      [
        17,
        "N",
        "E"
      ],
      [
        18,
        "W",
        "N"
      ],
      [
        19
      ],
      [
        20
      ],
      [
        21
      ],
      [
        22
      ],
      [
        23
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      2,
      2,
      0,
      0,
      0,
      1,
      1,
      0,
      0,
      3,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          4,
          4,
          0,
          0,
          0,
          2,
          2,
          0,
          0,
          4,
          0,
          0,
          4,
          0,
          0,
          0,
          0,
          0,
          4,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          11,
          12,
          17,
          18,
          13,
          8,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            11,
            12,
            17,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "actions": [
          5,
          0,
          0,
          1,
          1,
          6,
          12,
          12,
          18,
          18,
          9
        ]
      }
    ],
    "hintsEnabled": false,
    "outage": {
      "breakCell": 12,
      "turns": [
        [
          0,
          1
        ],
        [
          1,
          2
        ],
        [
          5,
          1
        ],
        [
          6,
          1
        ],
        [
          9,
          2
        ],
        [
          11,
          1
        ],
        [
          12,
          2
        ],
        [
          13,
          1
        ],
        [
          18,
          2
        ]
      ]
    }
  },
  {
    "id": 37,
    "displayNumber": 7,
    "chapter": 1,
    "name": "Найди свою дорожку",
    "timeLimitSeconds": 60,
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": false,
    "houseEntryGap": false,
    "completionStars": 3,
    "nextLevelId": 42,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      15,
      20,
      21,
      16,
      11,
      6,
      1,
      2,
      7,
      12,
      13,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        16,
        11,
        6,
        1,
        2,
        7,
        12,
        13,
        8,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "N",
        "S"
      ],
      [
        1,
        "S",
        "E"
      ],
      [
        2,
        "W",
        "S"
      ],
      [
        3
      ],
      [
        4
      ],
      [
        5
      ],
      [
        6,
        "S",
        "N"
      ],
      [
        7,
        "N",
        "S"
      ],
      [
        8,
        "S",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "S",
        "N"
      ],
      [
        12,
        "N",
        "E"
      ],
      [
        13,
        "W",
        "N"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "S",
        "N"
      ],
      [
        17,
        "N",
        "E"
      ],
      [
        18,
        "E",
        "S"
      ],
      [
        19,
        "W",
        "S"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "N"
      ],
      [
        22
      ],
      [
        23,
        "E",
        "N"
      ],
      [
        24,
        "W",
        "N"
      ]
    ],
    "initialRotations": [
      0,
      2,
      2,
      0,
      0,
      0,
      1,
      1,
      1,
      2,
      0,
      1,
      1,
      2,
      0,
      1,
      1,
      0,
      1,
      3,
      0,
      2,
      0,
      2,
      1
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          0,
          4,
          4,
          0,
          0,
          0,
          0,
          2,
          0,
          4,
          0,
          0,
          0,
          4,
          0,
          2,
          2,
          0,
          0,
          0,
          0,
          4,
          0,
          0,
          0
        ],
        "path": [
          10,
          15,
          20,
          21,
          16,
          11,
          6,
          1,
          2,
          7,
          12,
          13,
          8,
          9,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            16,
            11,
            6,
            1,
            2,
            7,
            12,
            13,
            8,
            9,
            14
          ]
        ],
        "actions": [
          15,
          21,
          21,
          16,
          11,
          6,
          1,
          1,
          2,
          2,
          7,
          12,
          12,
          12,
          13,
          13,
          8,
          8,
          8,
          9,
          9
        ]
      }
    ],
    "hintsEnabled": false
  },
  {
    "id": 42,
    "displayNumber": 8,
    "chapter": 1,
    "name": "За ближним поворотом",
    "timeLimitSeconds": 50,
    "tutorial": false,
    "hintTutorial": false,
    "hintsEnabled": false,
    "readyCoach": false,
    "houseEntryGap": true,
    "completionStars": 3,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      5,
      0,
      1,
      2,
      7,
      6,
      11,
      12,
      17,
      18,
      13,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        2,
        7,
        6,
        11,
        12,
        17,
        18,
        13,
        8,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "E"
      ],
      [
        2,
        "W",
        "S"
      ],
      [
        3,
        "N",
        "E"
      ],
      [
        4,
        "N",
        "E"
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "E",
        "S"
      ],
      [
        7,
        "N",
        "W"
      ],
      [
        8,
        "S",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "N",
        "E"
      ],
      [
        12,
        "W",
        "S"
      ],
      [
        13,
        "S",
        "N"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "E",
        "S"
      ],
      [
        16,
        "W",
        "S"
      ],
      [
        17,
        "N",
        "E"
      ],
      [
        18,
        "W",
        "N"
      ],
      [
        19
      ],
      [
        20,
        "E",
        "N"
      ],
      [
        21,
        "W",
        "N"
      ],
      [
        22,
        "N",
        "S"
      ],
      [
        23
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      2,
      1,
      2,
      3,
      1,
      1,
      2,
      2,
      1,
      2,
      0,
      3,
      3,
      1,
      0,
      1,
      2,
      3,
      3,
      0,
      3,
      1,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          4,
          0,
          4,
          3,
          1,
          0,
          4,
          4,
          0,
          0,
          0,
          4,
          4,
          0,
          0,
          0,
          0,
          4,
          4,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          2,
          7,
          6,
          11,
          12,
          17,
          18,
          13,
          8,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            2,
            7,
            6,
            11,
            12,
            17,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "actions": [
          5,
          0,
          0,
          1,
          2,
          2,
          7,
          7,
          6,
          6,
          11,
          12,
          17,
          18,
          13,
          8,
          8,
          8,
          9,
          9
        ]
      }
    ],
    "nextLevelId": 38
  },
  {
    "id": 38,
    "displayNumber": 9,
    "chapter": 1,
    "name": "Через середину двора",
    "tutorial": false,
    "hintTutorial": false,
    "hintsEnabled": false,
    "readyCoach": false,
    "houseEntryGap": true,
    "completionStars": 3,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      15,
      20,
      21,
      22,
      17,
      16,
      11,
      6,
      7,
      8,
      3,
      4,
      9,
      14
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        22,
        17,
        16,
        11,
        6,
        7,
        8,
        3,
        4,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "N",
        "S"
      ],
      [
        1
      ],
      [
        2
      ],
      [
        3,
        "S",
        "E"
      ],
      [
        4,
        "W",
        "S"
      ],
      [
        5
      ],
      [
        6,
        "S",
        "E"
      ],
      [
        7,
        "W",
        "E"
      ],
      [
        8,
        "W",
        "N"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "S",
        "N"
      ],
      [
        12,
        "N",
        "E"
      ],
      [
        13,
        "N",
        "E"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "E",
        "N"
      ],
      [
        17,
        "S",
        "W"
      ],
      [
        18,
        "N",
        "S"
      ],
      [
        19,
        "N",
        "S"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      1,
      0,
      0,
      3,
      3,
      0,
      2,
      0,
      3,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      2,
      2,
      1,
      1,
      2,
      0,
      2,
      0,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          1,
          0,
          0,
          4,
          4,
          0,
          4,
          0,
          4,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          4,
          4,
          1,
          1,
          4,
          0,
          4,
          0,
          0
        ],
        "path": [
          10,
          15,
          20,
          21,
          22,
          17,
          16,
          11,
          6,
          7,
          8,
          3,
          4,
          9,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            22,
            17,
            16,
            11,
            6,
            7,
            8,
            3,
            4,
            9,
            14
          ]
        ],
        "actions": [
          20,
          20,
          22,
          22,
          17,
          17,
          16,
          16,
          6,
          6,
          8,
          3,
          4
        ]
      }
    ],
    "nextLevelId": 43,
    "outage": {
      "breakCell": 11,
      "hintRoute": [
        10,
        11,
        6,
        7,
        12,
        17,
        18,
        13,
        8,
        9,
        14
      ],
      "solution": [
        [0, "N", "S"],
        [1],
        [2],
        [3, "W", "E"],
        [4, "N", "S"],
        [5],
        [6, "S", "E"],
        [7, "W", "S"],
        [8, "S", "E"],
        [9, "W", "S"],
        [10, "W", "E"],
        [11, "W", "N"],
        [12, "N", "S"],
        [13, "S", "N"],
        [14, "N", "E"],
        [15, "N", "S"],
        [16, "E", "S"],
        [17, "N", "E"],
        [18, "W", "N"],
        [19, "N", "S"],
        [20, "N", "E"],
        [21, "W", "E"],
        [22, "W", "S"],
        [23],
        [24]
      ],
      "initialRotations": [
        1, 0, 0, 2, 1,
        0, 1, 0, 3, 0,
        0, 0, 1, 1, 3,
        2, 1, 3, 0, 1,
        3, 1, 2, 0, 0
      ]
    }
  },
  {
    "id": 43,
    "displayNumber": 10,
    "chapter": 1,
    "name": "Дальний обход",
    "timeLimitSeconds": 30,
    "tutorial": false,
    "hintTutorial": false,
    "hintsEnabled": false,
    "readyCoach": false,
    "houseEntryGap": true,
    "completionStars": 3,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      5,
      0,
      1,
      6,
      11,
      16,
      21,
      22,
      17,
      12,
      7,
      8,
      3,
      4,
      9,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        6,
        11,
        16,
        21,
        22,
        17,
        12,
        7,
        8,
        3,
        4,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "S"
      ],
      [
        2
      ],
      [
        3,
        "S",
        "E"
      ],
      [
        4,
        "W",
        "S"
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "N",
        "S"
      ],
      [
        7,
        "S",
        "E"
      ],
      [
        8,
        "W",
        "N"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "N",
        "S"
      ],
      [
        12,
        "S",
        "N"
      ],
      [
        13,
        "N",
        "E"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "E"
      ],
      [
        16,
        "N",
        "S"
      ],
      [
        17,
        "S",
        "N"
      ],
      [
        18,
        "N",
        "S"
      ],
      [
        19,
        "N",
        "S"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      2,
      2,
      0,
      3,
      3,
      0,
      0,
      3,
      3,
      0,
      3,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      3,
      2,
      3,
      2,
      2,
      0,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          4,
          4,
          0,
          4,
          4,
          0,
          0,
          4,
          4,
          0,
          4,
          0,
          0,
          2,
          0,
          0,
          0,
          0,
          3,
          2,
          3,
          4,
          4,
          0,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          11,
          16,
          21,
          22,
          17,
          12,
          7,
          8,
          3,
          4,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            11,
            16,
            21,
            22,
            17,
            12,
            7,
            8,
            3,
            4,
            9,
            14
          ]
        ],
        "actions": [
          10,
          0,
          0,
          1,
          1,
          21,
          21,
          22,
          22,
          7,
          8,
          3,
          4
        ]
      }
    ],
    "nextLevelId": 44
  },
  {
    "id": 44,
    "displayNumber": 11,
    "chapter": 1,
    "name": "Перед большим путём",
    "timeLimitSeconds": 90,
    "tutorial": false,
    "hintTutorial": false,
    "hintsEnabled": false,
    "readyCoach": false,
    "houseEntryGap": true,
    "completionStars": 3,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      15,
      20,
      21,
      16,
      17,
      12,
      11,
      6,
      1,
      2,
      7,
      8,
      13,
      18,
      19,
      14
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        16,
        17,
        12,
        11,
        6,
        1,
        2,
        7,
        8,
        13,
        18,
        19,
        14
      ]
    ],
    "solution": [
      [
        0,
        "N",
        "S"
      ],
      [
        1,
        "S",
        "E"
      ],
      [
        2,
        "W",
        "S"
      ],
      [
        3,
        "N",
        "E"
      ],
      [
        4,
        "N",
        "S"
      ],
      [
        5,
        "N",
        "S"
      ],
      [
        6,
        "S",
        "N"
      ],
      [
        7,
        "N",
        "E"
      ],
      [
        8,
        "W",
        "S"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "E",
        "N"
      ],
      [
        12,
        "S",
        "W"
      ],
      [
        13,
        "N",
        "S"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "S",
        "E"
      ],
      [
        17,
        "W",
        "N"
      ],
      [
        18,
        "N",
        "E"
      ],
      [
        19,
        "W",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "N"
      ],
      [
        22,
        "N",
        "E"
      ],
      [
        23,
        "N",
        "S"
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      3,
      3,
      3,
      1,
      2,
      3,
      0,
      3,
      0,
      2,
      0,
      3,
      2,
      0,
      0,
      0,
      2,
      2,
      0,
      0,
      2,
      2,
      0,
      2,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          3,
          4,
          4,
          1,
          2,
          3,
          0,
          4,
          0,
          2,
          0,
          4,
          4,
          0,
          0,
          0,
          4,
          4,
          0,
          0,
          4,
          4,
          0,
          2,
          0
        ],
        "path": [
          10,
          15,
          20,
          21,
          16,
          17,
          12,
          11,
          6,
          1,
          2,
          7,
          8,
          13,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            16,
            17,
            12,
            11,
            6,
            1,
            2,
            7,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "actions": [
          20,
          20,
          21,
          21,
          16,
          16,
          17,
          17,
          12,
          12,
          11,
          1,
          2,
          7
        ]
      }
    ],
    "nextLevelId": 1
  },
  {
    "id": 1,
    "houseEntryGap": true,
    "name": "Первый огонёк",
    "tutorial": false,
    "nextLevelId": 41,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [],
    "hintRoute": [
      10,
      5,
      0,
      1,
      6,
      7,
      12,
      11,
      16,
      21,
      22,
      17,
      18,
      13,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        6,
        7,
        12,
        11,
        16,
        21,
        22,
        17,
        18,
        13,
        8,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "E",
        "S"
      ],
      [
        1,
        "S",
        "W"
      ],
      [
        2,
        "N",
        "E"
      ],
      [
        3,
        "N",
        "S"
      ],
      [
        4,
        "S",
        "W"
      ],
      [
        5,
        "N",
        "S"
      ],
      [
        6,
        "N",
        "E"
      ],
      [
        7,
        "S",
        "W"
      ],
      [
        8,
        "E",
        "S"
      ],
      [
        9,
        "S",
        "W"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "E",
        "S"
      ],
      [
        12,
        "N",
        "W"
      ],
      [
        13,
        "N",
        "S"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "E"
      ],
      [
        16,
        "N",
        "S"
      ],
      [
        17,
        "S",
        "E"
      ],
      [
        18,
        "W",
        "N"
      ],
      [
        19,
        "N",
        "S"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23,
        "N",
        "S"
      ],
      [
        24,
        "N",
        "W"
      ]
    ],
    "initialRotations": [
      3,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      3,
      3,
      3,
      0,
      0,
      0,
      2,
      0,
      0,
      3,
      3,
      0,
      0
    ],
    "variants": [
      {
        "stars": 3,
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          7,
          12,
          11,
          16,
          21,
          22,
          17,
          18,
          13,
          8,
          9,
          14
        ],
        "actions": [
          0,
          1,
          1,
          12,
          13,
          14,
          18,
          18,
          21,
          22
        ]
      }
    ],
    "displayNumber": 12,
    "chapter": 1,
    "completionStars": 3,
    "hintsEnabled": true,
    "hintTutorial": true,
    "readyCoach": false
  },
  {
    "id": 41,
    "displayNumber": 13,
    "chapter": 1,
    "name": "Первый свет звезды",
    "timeLimitSeconds": 95,
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": false,
    "houseEntryGap": false,
    "baseStars": 2,
    "intro": "stars",
    "nextLevelId": 39,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      7
    ],
    "hintRoute": [
      10,
      5,
      0,
      1,
      6,
      7,
      2,
      3,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        6,
        7,
        2,
        3,
        8,
        9,
        14
      ]
    ],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "S"
      ],
      [
        2,
        "S",
        "E"
      ],
      [
        3,
        "W",
        "S"
      ],
      [
        4
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "N",
        "E"
      ],
      [
        7,
        "W",
        "N"
      ],
      [
        8,
        "N",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11
      ],
      [
        12
      ],
      [
        13
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "E"
      ],
      [
        16,
        "W",
        "E"
      ],
      [
        17,
        "W",
        "E"
      ],
      [
        18,
        "W",
        "E"
      ],
      [
        19,
        "W",
        "N"
      ],
      [
        20
      ],
      [
        21
      ],
      [
        22,
        "N",
        "S"
      ],
      [
        23
      ],
      [
        24
      ]
    ],
    "initialRotations": [
      3,
      3,
      3,
      0,
      0,
      1,
      2,
      3,
      3,
      3,
      2,
      0,
      0,
      0,
      0,
      2,
      1,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 2,
        "rotations": [
          3,
          3,
          3,
          0,
          0,
          1,
          2,
          3,
          3,
          3,
          3,
          0,
          0,
          0,
          1,
          4,
          2,
          0,
          2,
          4,
          0,
          0,
          0,
          0,
          0
        ],
        "path": [
          10,
          15,
          16,
          17,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            15,
            16,
            17,
            18,
            19,
            14
          ]
        ],
        "actions": [
          10,
          15,
          15,
          16,
          18,
          19,
          19,
          19,
          14
        ]
      },
      {
        "stars": 3,
        "rotations": [
          4,
          4,
          4,
          0,
          0,
          2,
          4,
          4,
          4,
          4,
          4,
          0,
          0,
          0,
          0,
          2,
          1,
          0,
          1,
          1,
          0,
          0,
          0,
          0,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          7,
          2,
          3,
          8,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            7,
            2,
            3,
            8,
            9,
            14
          ]
        ],
        "actions": [
          10,
          10,
          5,
          0,
          1,
          6,
          6,
          7,
          2,
          8,
          9
        ]
      }
    ],
    "hintsEnabled": true
  },
  {
    "id": 39,
    "displayNumber": 14,
    "chapter": 1,
    "timeLimitSeconds": 90,
    "name": "Дорога к звезде",
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": false,
    "houseEntryGap": false,
    "baseStars": 2,
    "nextLevelId": 40,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      2
    ],
    "hintRoute": [
      10,
      15,
      20,
      21,
      16,
      11,
      6,
      1,
      2,
      3,
      8,
      7,
      12,
      13,
      18,
      19,
      14
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        16,
        11,
        6,
        1,
        2,
        3,
        8,
        7,
        12,
        13,
        18,
        19,
        14
      ]
    ],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "S",
        "E"
      ],
      [
        2,
        "W",
        "E"
      ],
      [
        3,
        "W",
        "S"
      ],
      [
        4
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "S",
        "N"
      ],
      [
        7,
        "E",
        "S"
      ],
      [
        8,
        "N",
        "W"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "S",
        "N"
      ],
      [
        12,
        "N",
        "E"
      ],
      [
        13,
        "W",
        "S"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "S",
        "N"
      ],
      [
        17
      ],
      [
        18,
        "N",
        "E"
      ],
      [
        19,
        "W",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "N"
      ],
      [
        22,
        "W",
        "E"
      ],
      [
        23,
        "W",
        "N"
      ],
      [
        24,
        "N",
        "S"
      ]
    ],
    "initialRotations": [
      0,
      2,
      0,
      3,
      0,
      2,
      0,
      0,
      1,
      0,
      0,
      0,
      2,
      2,
      0,
      1,
      0,
      0,
      2,
      3,
      0,
      1,
      0,
      1,
      0
    ],
    "variants": [
      {
        "stars": 2,
        "rotations": [
          0,
          5,
          0,
          3,
          0,
          2,
          0,
          0,
          1,
          0,
          1,
          0,
          2,
          2,
          0,
          1,
          0,
          0,
          5,
          4,
          0,
          1,
          0,
          4,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          11,
          16,
          21,
          22,
          23,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            11,
            16,
            21,
            22,
            23,
            18,
            19,
            14
          ]
        ],
        "actions": [
          10,
          1,
          1,
          1,
          23,
          23,
          23,
          18,
          18,
          18,
          19
        ]
      },
      {
        "stars": 3,
        "rotations": [
          0,
          4,
          0,
          4,
          0,
          2,
          0,
          0,
          4,
          0,
          0,
          0,
          4,
          4,
          0,
          2,
          0,
          0,
          4,
          4,
          0,
          4,
          0,
          1,
          0
        ],
        "path": [
          10,
          15,
          20,
          21,
          16,
          11,
          6,
          1,
          2,
          3,
          8,
          7,
          12,
          13,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            16,
            11,
            6,
            1,
            2,
            3,
            8,
            7,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "actions": [
          15,
          21,
          21,
          21,
          1,
          1,
          3,
          8,
          8,
          8,
          12,
          12,
          13,
          13,
          18,
          18,
          19
        ]
      }
    ],
    "hintsEnabled": true
  },
  {
    "id": 40,
    "displayNumber": 15,
    "chapter": 1,
    "name": "Два огонька",
    "timeLimitSeconds": 60,
    "tutorial": false,
    "hintTutorial": false,
    "readyCoach": false,
    "houseEntryGap": false,
    "intro": "route",
    "lessonStar": 22,
    "nextLevelId": 2,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      3,
      22
    ],
    "hintRoute": [
      10,
      5,
      0,
      1,
      6,
      7,
      2,
      3,
      8,
      13,
      12,
      17,
      22,
      23,
      18,
      19,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        6,
        7,
        2,
        3,
        8,
        13,
        12,
        17,
        22,
        23,
        18,
        19,
        14
      ]
    ],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "S"
      ],
      [
        2,
        "S",
        "E"
      ],
      [
        3,
        "W",
        "S"
      ],
      [
        4,
        "N",
        "E"
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "N",
        "E"
      ],
      [
        7,
        "W",
        "N"
      ],
      [
        8,
        "N",
        "S"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "N",
        "E"
      ],
      [
        12,
        "E",
        "S"
      ],
      [
        13,
        "N",
        "W"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "N",
        "S"
      ],
      [
        17,
        "N",
        "S"
      ],
      [
        18,
        "S",
        "E"
      ],
      [
        19,
        "W",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "N",
        "E"
      ],
      [
        23,
        "W",
        "N"
      ],
      [
        24,
        "N",
        "E"
      ]
    ],
    "initialRotations": [
      3,
      2,
      3,
      3,
      0,
      1,
      3,
      3,
      1,
      0,
      0,
      0,
      3,
      2,
      0,
      0,
      0,
      1,
      2,
      3,
      0,
      0,
      3,
      3,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "rotations": [
          4,
          4,
          3,
          3,
          0,
          2,
          4,
          3,
          1,
          0,
          0,
          0,
          3,
          3,
          0,
          0,
          0,
          1,
          3,
          4,
          0,
          0,
          3,
          3,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          7,
          12,
          13,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            7,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "actions": [
          5,
          0,
          1,
          1,
          6,
          13,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "rotations": [
          4,
          4,
          3,
          3,
          2,
          2,
          4,
          3,
          2,
          0,
          0,
          0,
          3,
          4,
          3,
          0,
          0,
          1,
          2,
          3,
          0,
          0,
          3,
          3,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          7,
          12,
          13,
          8,
          3,
          4,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            7,
            12,
            13,
            8,
            3,
            4,
            9,
            14
          ]
        ],
        "actions": [
          5,
          0,
          1,
          1,
          6,
          13,
          13,
          8,
          4,
          4,
          14,
          14,
          14
        ]
      },
      {
        "stars": 2,
        "rotations": [
          3,
          2,
          3,
          3,
          0,
          1,
          3,
          3,
          1,
          0,
          3,
          1,
          5,
          2,
          0,
          0,
          0,
          2,
          4,
          4,
          0,
          3,
          4,
          4,
          0
        ],
        "path": [
          10,
          15,
          20,
          21,
          16,
          11,
          12,
          17,
          22,
          23,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            16,
            11,
            12,
            17,
            22,
            23,
            18,
            19,
            14
          ]
        ],
        "actions": [
          10,
          10,
          10,
          21,
          21,
          21,
          11,
          12,
          12,
          17,
          22,
          23,
          18,
          18,
          19
        ]
      },
      {
        "stars": 3,
        "rotations": [
          4,
          4,
          4,
          4,
          0,
          2,
          4,
          4,
          2,
          0,
          0,
          0,
          4,
          4,
          0,
          0,
          0,
          2,
          4,
          4,
          0,
          0,
          4,
          4,
          0
        ],
        "path": [
          10,
          5,
          0,
          1,
          6,
          7,
          2,
          3,
          8,
          13,
          12,
          17,
          22,
          23,
          18,
          19,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            7,
            2,
            3,
            8,
            13,
            12,
            17,
            22,
            23,
            18,
            19,
            14
          ]
        ],
        "actions": [
          5,
          0,
          1,
          1,
          6,
          7,
          2,
          3,
          8,
          13,
          13,
          12,
          17,
          22,
          23,
          18,
          18,
          19
        ]
      }
    ],
    "hintsEnabled": true
  },
  {
    "id": 2,
    "name": "Звёздная дорожка",
    "timeLimitSeconds": 60,
    "intro": "fixed",
    "lessonCells": [12],
    "fixed": [12],
    "tutorial": false,
    "nextLevelId": 3,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      1,
      23
    ],
    "hintRoute": [
      10,
      5,
      6,
      1,
      2,
      3,
      8,
      7,
      12,
      17,
      18,
      23,
      24,
      19,
      14
    ],
    "paths": [
      [
        10,
        5,
        6,
        1,
        2,
        3,
        8,
        7,
        12,
        17,
        18,
        23,
        24,
        19,
        14
      ]
    ],
    "switches": [],
    "solution": [
      [
        0,
        "N",
        "E"
      ],
      [
        1,
        "S",
        "E"
      ],
      [
        2,
        "W",
        "E"
      ],
      [
        3,
        "W",
        "S"
      ],
      [
        4,
        "N",
        "E"
      ],
      [
        5,
        "S",
        "E"
      ],
      [
        6,
        "W",
        "N"
      ],
      [
        7,
        "E",
        "S"
      ],
      [
        8,
        "N",
        "W"
      ],
      [
        9,
        "N",
        "E"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "N",
        "E"
      ],
      [
        12,
        "N",
        "S"
      ],
      [
        13,
        "N",
        "E"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "E"
      ],
      [
        16,
        "N",
        "E"
      ],
      [
        17,
        "N",
        "E"
      ],
      [
        18,
        "W",
        "S"
      ],
      [
        19,
        "S",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "N",
        "S"
      ],
      [
        23,
        "N",
        "E"
      ],
      [
        24,
        "W",
        "N"
      ]
    ],
    "initialRotations": [
      0,
      2,
      0,
      3,
      0,
      3,
      3,
      3,
      0,
      0,
      0,
      0,
      3,
      0,
      3,
      0,
      0,
      0,
      3,
      3,
      0,
      0,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          5,
          6,
          11,
          12,
          13,
          8,
          9,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          3,
          0,
          2,
          2,
          0,
          0,
          1,
          3,
          3,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "actions": [
          1,
          1,
          3,
          5,
          7,
          8,
          8,
          9,
          9,
          13,
          13,
          13,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          1,
          2,
          3,
          8,
          9,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          2,
          0,
          0,
          0,
          0,
          3,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "actions": [
          1,
          1,
          3,
          5,
          6,
          7,
          8,
          9,
          9,
          12,
          18,
          19
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          5,
          6,
          1,
          2,
          3,
          8,
          7,
          12,
          17,
          18,
          23,
          24,
          19,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "actions": [
          1,
          1,
          3,
          5,
          6,
          7,
          12,
          14,
          18,
          19
        ]
      }
    ],
    "displayNumber": 16,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false
  },
  {
    "id": 3,
    "name": "Тропа у калитки",
    "tutorial": false,
    "nextLevelId": 4,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      12,
      15
    ],
    "hintRoute": [
      10,
      15,
      20,
      21,
      16,
      17,
      12,
      11,
      6,
      7,
      2,
      3,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        16,
        17,
        12,
        11,
        6,
        7,
        2,
        3,
        8,
        9,
        14
      ]
    ],
    "switches": [],
    "solution": [
      [
        0,
        "N",
        "E"
      ],
      [
        1,
        "N",
        "E"
      ],
      [
        2,
        "S",
        "E"
      ],
      [
        3,
        "W",
        "S"
      ],
      [
        4,
        "N",
        "E"
      ],
      [
        5,
        "N",
        "E"
      ],
      [
        6,
        "S",
        "E"
      ],
      [
        7,
        "W",
        "N"
      ],
      [
        8,
        "N",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "E",
        "N"
      ],
      [
        12,
        "S",
        "W"
      ],
      [
        13,
        "N",
        "S"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "S",
        "E"
      ],
      [
        17,
        "W",
        "N"
      ],
      [
        18,
        "N",
        "E"
      ],
      [
        19,
        "N",
        "E"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "N"
      ],
      [
        22,
        "N",
        "E"
      ],
      [
        23,
        "N",
        "S"
      ],
      [
        24,
        "N",
        "E"
      ]
    ],
    "initialRotations": [
      0,
      0,
      3,
      3,
      3,
      1,
      0,
      1,
      1,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      3,
      0,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          5,
          6,
          1,
          2,
          7,
          8,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          1,
          5,
          3,
          3,
          1,
          2,
          1,
          2,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          3,
          3,
          0,
          0,
          0,
          0
        ],
        "actions": [
          6,
          6,
          1,
          2,
          2,
          8,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            5,
            6,
            1,
            2,
            7,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          1,
          2,
          5,
          6,
          7,
          8,
          10,
          13,
          14,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          11,
          12,
          7,
          8,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          0,
          3,
          3,
          3,
          1,
          1,
          2,
          2,
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          0,
          0,
          0,
          3,
          3,
          0,
          0,
          0,
          0
        ],
        "actions": [
          6,
          12,
          7,
          8,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            5,
            6,
            11,
            12,
            7,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          5,
          6,
          7,
          8,
          10,
          11,
          12,
          13,
          14,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          11,
          12,
          17,
          18,
          13,
          8,
          9,
          14
        ],
        "rotations": [
          0,
          0,
          3,
          3,
          3,
          1,
          1,
          1,
          1,
          0,
          1,
          0,
          0,
          0,
          4,
          0,
          0,
          1,
          3,
          0,
          3,
          0,
          0,
          0,
          0
        ],
        "actions": [
          6,
          17,
          18,
          18,
          18,
          14,
          14,
          14
        ],
        "paths": [
          [
            10,
            5,
            6,
            11,
            12,
            17,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "connected": [
          5,
          6,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          17,
          18
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          15,
          20,
          21,
          16,
          17,
          22,
          23,
          24,
          19,
          18,
          13,
          8,
          9,
          14
        ],
        "rotations": [
          0,
          0,
          3,
          3,
          3,
          1,
          0,
          1,
          1,
          0,
          4,
          0,
          0,
          0,
          4,
          0,
          0,
          3,
          0,
          2,
          4,
          0,
          0,
          1,
          3
        ],
        "actions": [
          10,
          10,
          10,
          20,
          17,
          17,
          17,
          23,
          24,
          24,
          24,
          19,
          19,
          14,
          14,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            16,
            17,
            22,
            23,
            24,
            19,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "connected": [
          8,
          9,
          10,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          15,
          20,
          21,
          16,
          17,
          12,
          11,
          6,
          7,
          2,
          3,
          8,
          9,
          14
        ],
        "rotations": [
          0,
          0,
          4,
          4,
          3,
          1,
          0,
          4,
          4,
          0,
          4,
          0,
          0,
          0,
          4,
          0,
          0,
          0,
          0,
          0,
          4,
          0,
          0,
          0,
          0
        ],
        "actions": [
          10,
          10,
          10,
          20,
          7,
          7,
          7,
          2,
          3,
          8,
          8,
          8,
          14,
          14,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            16,
            17,
            12,
            11,
            6,
            7,
            2,
            3,
            8,
            9,
            14
          ]
        ],
        "connected": [
          2,
          3,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          14,
          15,
          16,
          17,
          20,
          21
        ]
      }
    ],
    "routeStyle": "corridor",
    "displayNumber": 17,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false,
    "timeLimitSeconds": 70,
    "fixed": [2]
  },
  {
    "id": 4,
    "name": "С другой стороны",
    "tutorial": false,
    "nextLevelId": 5,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      2,
      22
    ],
    "hintRoute": [
      10,
      15,
      16,
      11,
      6,
      7,
      2,
      3,
      8,
      13,
      18,
      17,
      22,
      23,
      24,
      19,
      14
    ],
    "paths": [
      [
        10,
        15,
        16,
        11,
        6,
        7,
        2,
        3,
        8,
        13,
        18,
        17,
        22,
        23,
        24,
        19,
        14
      ]
    ],
    "switches": [],
    "solution": [
      [
        0,
        "N",
        "E"
      ],
      [
        1,
        "N",
        "E"
      ],
      [
        2,
        "S",
        "E"
      ],
      [
        3,
        "W",
        "S"
      ],
      [
        4,
        "N",
        "E"
      ],
      [
        5,
        "N",
        "E"
      ],
      [
        6,
        "S",
        "E"
      ],
      [
        7,
        "W",
        "N"
      ],
      [
        8,
        "N",
        "S"
      ],
      [
        9,
        "N",
        "E"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "S",
        "N"
      ],
      [
        12,
        "N",
        "S"
      ],
      [
        13,
        "N",
        "S"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "E"
      ],
      [
        16,
        "W",
        "N"
      ],
      [
        17,
        "E",
        "S"
      ],
      [
        18,
        "N",
        "W"
      ],
      [
        19,
        "S",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "N",
        "S"
      ],
      [
        22,
        "N",
        "E"
      ],
      [
        23,
        "W",
        "E"
      ],
      [
        24,
        "W",
        "N"
      ]
    ],
    "initialRotations": [
      3,
      0,
      3,
      0,
      0,
      1,
      1,
      2,
      0,
      3,
      1,
      0,
      0,
      3,
      2,
      3,
      0,
      3,
      0,
      0,
      0,
      0,
      3,
      0,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          5,
          6,
          11,
          16,
          17,
          12,
          7,
          8,
          9,
          14
        ],
        "rotations": [
          3,
          0,
          3,
          0,
          0,
          1,
          1,
          2,
          1,
          6,
          1,
          0,
          0,
          3,
          3,
          3,
          1,
          6,
          0,
          0,
          0,
          0,
          3,
          0,
          0
        ],
        "actions": [
          16,
          17,
          17,
          17,
          8,
          9,
          9,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            6,
            11,
            16,
            17,
            12,
            7,
            8,
            9,
            14
          ]
        ],
        "connected": [
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          14,
          16,
          17
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          1,
          2,
          7,
          8,
          9,
          14
        ],
        "rotations": [
          3,
          1,
          5,
          0,
          0,
          1,
          2,
          5,
          1,
          6,
          1,
          0,
          0,
          3,
          3,
          3,
          0,
          3,
          0,
          0,
          0,
          0,
          3,
          0,
          0
        ],
        "actions": [
          6,
          1,
          2,
          2,
          7,
          7,
          7,
          8,
          9,
          9,
          9,
          14
        ],
        "paths": [
          [
            10,
            5,
            6,
            1,
            2,
            7,
            8,
            9,
            14
          ]
        ],
        "connected": [
          1,
          2,
          5,
          6,
          7,
          8,
          9,
          10,
          14
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          11,
          16,
          17,
          22,
          23,
          24,
          19,
          14
        ],
        "rotations": [
          3,
          0,
          3,
          0,
          0,
          1,
          1,
          2,
          0,
          3,
          1,
          0,
          0,
          3,
          4,
          3,
          1,
          5,
          0,
          0,
          0,
          0,
          4,
          0,
          0
        ],
        "actions": [
          16,
          17,
          17,
          22,
          14,
          14
        ],
        "paths": [
          [
            10,
            5,
            6,
            11,
            16,
            17,
            22,
            23,
            24,
            19,
            14
          ]
        ],
        "connected": [
          5,
          6,
          10,
          11,
          14,
          16,
          17,
          19,
          22,
          23,
          24
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          15,
          16,
          11,
          6,
          7,
          2,
          3,
          8,
          13,
          18,
          17,
          22,
          23,
          24,
          19,
          14
        ],
        "rotations": [
          3,
          0,
          4,
          0,
          0,
          1,
          4,
          4,
          0,
          3,
          4,
          0,
          0,
          4,
          4,
          4,
          0,
          4,
          0,
          0,
          0,
          0,
          4,
          0,
          0
        ],
        "actions": [
          10,
          10,
          10,
          15,
          6,
          6,
          6,
          7,
          7,
          2,
          13,
          17,
          22,
          14,
          14
        ],
        "paths": [
          [
            10,
            15,
            16,
            11,
            6,
            7,
            2,
            3,
            8,
            13,
            18,
            17,
            22,
            23,
            24,
            19,
            14
          ]
        ],
        "connected": [
          2,
          3,
          6,
          7,
          8,
          10,
          11,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          22,
          23,
          24
        ]
      }
    ],
    "routeStyle": "corridor",
    "displayNumber": 18,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false
  },
  {
    "id": 5,
    "name": "Дальний огонёк",
    "tutorial": false,
    "nextLevelId": 6,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      7,
      22
    ],
    "hintRoute": [
      10,
      11,
      16,
      15,
      20,
      21,
      22,
      17,
      18,
      13,
      12,
      7,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        11,
        16,
        15,
        20,
        21,
        22,
        17,
        18,
        13,
        12,
        7,
        8,
        9,
        14
      ]
    ],
    "switches": [],
    "solution": [
      [
        0,
        "N",
        "E"
      ],
      [
        1,
        "N",
        "S"
      ],
      [
        2,
        "N",
        "S"
      ],
      [
        3,
        "N",
        "S"
      ],
      [
        4,
        "N",
        "E"
      ],
      [
        5,
        "N",
        "E"
      ],
      [
        6,
        "N",
        "E"
      ],
      [
        7,
        "S",
        "E"
      ],
      [
        8,
        "W",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "E"
      ],
      [
        11,
        "W",
        "S"
      ],
      [
        12,
        "E",
        "N"
      ],
      [
        13,
        "S",
        "W"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "E",
        "S"
      ],
      [
        16,
        "N",
        "W"
      ],
      [
        17,
        "S",
        "E"
      ],
      [
        18,
        "W",
        "N"
      ],
      [
        19,
        "N",
        "E"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23,
        "N",
        "E"
      ],
      [
        24,
        "N",
        "E"
      ]
    ],
    "initialRotations": [
      0,
      0,
      0,
      3,
      0,
      3,
      3,
      3,
      0,
      3,
      3,
      3,
      1,
      3,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      3,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          11,
          16,
          17,
          12,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          3,
          0,
          3,
          3,
          3,
          0,
          3,
          4,
          4,
          1,
          4,
          1,
          0,
          1,
          2,
          1,
          3,
          0,
          3,
          0,
          0,
          0
        ],
        "actions": [
          10,
          11,
          16,
          17,
          13,
          18,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            11,
            16,
            17,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          10,
          11,
          12,
          13,
          14,
          16,
          17,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          11,
          6,
          7,
          12,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          3,
          0,
          3,
          5,
          5,
          0,
          3,
          4,
          5,
          4,
          4,
          1,
          0,
          0,
          1,
          1,
          3,
          0,
          3,
          0,
          0,
          0
        ],
        "actions": [
          10,
          11,
          11,
          6,
          6,
          7,
          7,
          12,
          12,
          12,
          13,
          18,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            11,
            6,
            7,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          6,
          7,
          10,
          11,
          12,
          13,
          14,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          11,
          16,
          17,
          22,
          23,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          3,
          0,
          3,
          3,
          3,
          0,
          3,
          4,
          4,
          1,
          3,
          1,
          0,
          1,
          1,
          2,
          3,
          0,
          3,
          1,
          3,
          0
        ],
        "actions": [
          10,
          11,
          16,
          22,
          23,
          23,
          23,
          18,
          18,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            11,
            16,
            17,
            22,
            23,
            18,
            19,
            14
          ]
        ],
        "connected": [
          10,
          11,
          14,
          16,
          17,
          18,
          19,
          22,
          23
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          11,
          6,
          5,
          0,
          1,
          2,
          3,
          4,
          9,
          8,
          7,
          12,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          1,
          1,
          1,
          3,
          2,
          4,
          6,
          4,
          0,
          5,
          4,
          5,
          4,
          4,
          1,
          0,
          0,
          1,
          1,
          3,
          0,
          3,
          0,
          0,
          0
        ],
        "actions": [
          10,
          11,
          11,
          6,
          6,
          6,
          5,
          0,
          1,
          2,
          4,
          4,
          9,
          9,
          7,
          12,
          12,
          12,
          13,
          18,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            11,
            6,
            5,
            0,
            1,
            2,
            3,
            4,
            9,
            8,
            7,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          18,
          19
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          11,
          16,
          15,
          20,
          21,
          22,
          17,
          18,
          13,
          12,
          7,
          8,
          9,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          3,
          0,
          3,
          3,
          4,
          0,
          4,
          4,
          4,
          4,
          4,
          4,
          0,
          0,
          4,
          0,
          0,
          0,
          4,
          0,
          0,
          0
        ],
        "actions": [
          10,
          11,
          21,
          17,
          17,
          17,
          13,
          12,
          12,
          12,
          7,
          9,
          14,
          14,
          14
        ],
        "paths": [
          [
            10,
            11,
            16,
            15,
            20,
            21,
            22,
            17,
            18,
            13,
            12,
            7,
            8,
            9,
            14
          ]
        ],
        "connected": [
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          20,
          21,
          22
        ]
      }
    ],
    "routeStyle": "corridor",
    "displayNumber": 19,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false
  },
  {
    "id": 6,
    "name": "Общий участок",
    "tutorial": false,
    "nextLevelId": 7,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      0,
      22
    ],
    "hintRoute": [
      10,
      5,
      0,
      1,
      2,
      7,
      6,
      11,
      16,
      21,
      22,
      17,
      18,
      13,
      8,
      9,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        2,
        7,
        6,
        11,
        16,
        21,
        22,
        17,
        18,
        13,
        8,
        9,
        14
      ]
    ],
    "switches": [],
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "E"
      ],
      [
        2,
        "W",
        "S"
      ],
      [
        3,
        "N",
        "E"
      ],
      [
        4,
        "N",
        "S"
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "E",
        "S"
      ],
      [
        7,
        "N",
        "W"
      ],
      [
        8,
        "S",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "N",
        "S"
      ],
      [
        12,
        "N",
        "S"
      ],
      [
        13,
        "S",
        "N"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "E"
      ],
      [
        16,
        "N",
        "S"
      ],
      [
        17,
        "S",
        "E"
      ],
      [
        18,
        "W",
        "N"
      ],
      [
        19,
        "N",
        "E"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23,
        "N",
        "S"
      ],
      [
        24,
        "N",
        "E"
      ]
    ],
    "initialRotations": [
      3,
      0,
      3,
      0,
      0,
      0,
      0,
      1,
      3,
      0,
      3,
      0,
      3,
      3,
      1,
      0,
      1,
      3,
      1,
      2,
      0,
      3,
      3,
      0,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          15,
          16,
          17,
          12,
          7,
          8,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          3,
          0,
          3,
          0,
          0,
          0,
          0,
          2,
          5,
          0,
          3,
          0,
          4,
          4,
          1,
          0,
          1,
          6,
          1,
          3,
          0,
          3,
          3,
          0,
          0
        ],
        "actions": [
          17,
          17,
          17,
          12,
          7,
          8,
          8,
          13,
          19
        ],
        "paths": [
          [
            10,
            15,
            16,
            17,
            12,
            7,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          7,
          8,
          10,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          0,
          1,
          2,
          7,
          8,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          4,
          0,
          4,
          0,
          0,
          0,
          0,
          1,
          5,
          0,
          4,
          0,
          3,
          4,
          1,
          0,
          1,
          3,
          1,
          3,
          0,
          3,
          3,
          0,
          0
        ],
        "actions": [
          10,
          0,
          2,
          8,
          8,
          13,
          19
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            2,
            7,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          0,
          1,
          2,
          5,
          7,
          8,
          10,
          13,
          14,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          15,
          16,
          17,
          22,
          23,
          24,
          19,
          18,
          13,
          8,
          9,
          14
        ],
        "rotations": [
          3,
          0,
          3,
          0,
          0,
          0,
          0,
          1,
          4,
          0,
          3,
          0,
          3,
          4,
          4,
          0,
          1,
          5,
          1,
          2,
          0,
          3,
          5,
          1,
          3
        ],
        "actions": [
          17,
          17,
          22,
          22,
          23,
          24,
          24,
          24,
          13,
          8,
          14,
          14,
          14
        ],
        "paths": [
          [
            10,
            15,
            16,
            17,
            22,
            23,
            24,
            19,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "connected": [
          8,
          9,
          10,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          22,
          23,
          24
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          5,
          0,
          1,
          2,
          7,
          6,
          11,
          16,
          21,
          22,
          17,
          18,
          13,
          8,
          9,
          14
        ],
        "rotations": [
          4,
          0,
          4,
          0,
          0,
          0,
          0,
          4,
          4,
          0,
          4,
          0,
          3,
          4,
          4,
          0,
          2,
          4,
          4,
          2,
          0,
          4,
          4,
          0,
          0
        ],
        "actions": [
          10,
          0,
          2,
          7,
          7,
          7,
          16,
          21,
          22,
          17,
          18,
          18,
          18,
          13,
          8,
          14,
          14,
          14
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            2,
            7,
            6,
            11,
            16,
            21,
            22,
            17,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "connected": [
          0,
          1,
          2,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          13,
          14,
          16,
          17,
          18,
          21,
          22
        ]
      }
    ],
    "routeStyle": "corridor",
    "displayNumber": 20,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false
  },
  {
    "id": 7,
    "name": "Последний поворот",
    "tutorial": false,
    "nextLevelId": 8,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      7,
      21
    ],
    "hintRoute": [
      10,
      15,
      20,
      21,
      16,
      17,
      12,
      11,
      6,
      7,
      2,
      3,
      4,
      9,
      8,
      13,
      18,
      19,
      14
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        16,
        17,
        12,
        11,
        6,
        7,
        2,
        3,
        4,
        9,
        8,
        13,
        18,
        19,
        14
      ]
    ],
    "switches": [],
    "solution": [
      [
        0,
        "N",
        "E"
      ],
      [
        1,
        "N",
        "E"
      ],
      [
        2,
        "S",
        "E"
      ],
      [
        3,
        "W",
        "E"
      ],
      [
        4,
        "W",
        "S"
      ],
      [
        5,
        "N",
        "E"
      ],
      [
        6,
        "S",
        "E"
      ],
      [
        7,
        "W",
        "N"
      ],
      [
        8,
        "E",
        "S"
      ],
      [
        9,
        "N",
        "W"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "E",
        "N"
      ],
      [
        12,
        "S",
        "W"
      ],
      [
        13,
        "N",
        "S"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "S",
        "E"
      ],
      [
        17,
        "W",
        "N"
      ],
      [
        18,
        "N",
        "E"
      ],
      [
        19,
        "W",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "N"
      ],
      [
        22,
        "N",
        "S"
      ],
      [
        23,
        "N",
        "S"
      ],
      [
        24,
        "N",
        "E"
      ]
    ],
    "initialRotations": [
      3,
      0,
      0,
      3,
      3,
      0,
      1,
      3,
      0,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      0,
      1,
      0,
      3,
      0,
      3,
      0,
      3,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          5,
          6,
          11,
          12,
          17,
          18,
          13,
          8,
          9,
          14
        ],
        "rotations": [
          3,
          0,
          0,
          3,
          3,
          1,
          1,
          3,
          0,
          3,
          5,
          4,
          4,
          4,
          3,
          3,
          0,
          1,
          3,
          3,
          0,
          3,
          0,
          3,
          0
        ],
        "actions": [
          10,
          10,
          5,
          11,
          12,
          18,
          18,
          18,
          13
        ],
        "paths": [
          [
            10,
            5,
            6,
            11,
            12,
            17,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "connected": [
          5,
          6,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          17,
          18
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          1,
          2,
          7,
          8,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          3,
          1,
          1,
          3,
          3,
          1,
          2,
          5,
          1,
          3,
          5,
          3,
          3,
          4,
          4,
          3,
          0,
          1,
          0,
          4,
          0,
          3,
          0,
          3,
          0
        ],
        "actions": [
          10,
          10,
          5,
          6,
          1,
          2,
          7,
          7,
          8,
          13,
          19,
          14
        ],
        "paths": [
          [
            10,
            5,
            6,
            1,
            2,
            7,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          1,
          2,
          5,
          6,
          7,
          8,
          10,
          13,
          14,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          11,
          12,
          7,
          8,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          3,
          0,
          0,
          3,
          3,
          1,
          1,
          6,
          1,
          3,
          5,
          4,
          5,
          4,
          4,
          3,
          0,
          1,
          0,
          4,
          0,
          3,
          0,
          3,
          0
        ],
        "actions": [
          10,
          10,
          5,
          11,
          12,
          12,
          7,
          7,
          7,
          8,
          13,
          19,
          14
        ],
        "paths": [
          [
            10,
            5,
            6,
            11,
            12,
            7,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          5,
          6,
          7,
          8,
          10,
          11,
          12,
          13,
          14,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          6,
          11,
          12,
          17,
          16,
          21,
          22,
          23,
          24,
          19,
          18,
          13,
          8,
          9,
          14
        ],
        "rotations": [
          3,
          0,
          0,
          3,
          3,
          1,
          1,
          3,
          0,
          3,
          5,
          4,
          4,
          4,
          3,
          3,
          0,
          4,
          0,
          3,
          0,
          5,
          1,
          3,
          3
        ],
        "actions": [
          10,
          10,
          5,
          11,
          12,
          17,
          17,
          17,
          21,
          21,
          22,
          24,
          24,
          24,
          13
        ],
        "paths": [
          [
            10,
            5,
            6,
            11,
            12,
            17,
            16,
            21,
            22,
            23,
            24,
            19,
            18,
            13,
            8,
            9,
            14
          ]
        ],
        "connected": [
          5,
          6,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          16,
          17,
          18,
          19,
          21,
          22,
          23,
          24
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          15,
          20,
          21,
          16,
          17,
          12,
          11,
          6,
          7,
          2,
          3,
          4,
          9,
          8,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          3,
          0,
          0,
          4,
          4,
          0,
          4,
          4,
          0,
          4,
          4,
          4,
          4,
          4,
          4,
          4,
          0,
          4,
          0,
          4,
          0,
          4,
          0,
          3,
          0
        ],
        "actions": [
          10,
          15,
          21,
          17,
          17,
          17,
          12,
          11,
          6,
          6,
          6,
          7,
          3,
          4,
          9,
          13,
          19,
          14
        ],
        "paths": [
          [
            10,
            15,
            20,
            21,
            16,
            17,
            12,
            11,
            6,
            7,
            2,
            3,
            4,
            9,
            8,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          2,
          3,
          4,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21
        ]
      }
    ],
    "routeStyle": "corridor",
    "displayNumber": 21,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false
  },
  {
    "id": 8,
    "name": "Старый рубильник",
    "tutorial": false,
    "intro": "switch",
    "nextLevelId": 9,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      5,
      13
    ],
    "hintRoute": [
      10,
      5,
      0,
      1,
      2,
      3,
      4,
      9,
      8,
      7,
      12,
      13,
      18,
      19,
      14
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        2,
        3,
        4,
        9,
        8,
        7,
        12,
        13,
        18,
        19,
        14
      ]
    ],
    "switches": [
      {
        "index": 9,
        "linked": 19
      }
    ],
    "solution": [
      [
        0,
        "E",
        "S"
      ],
      [
        1,
        "E",
        "W"
      ],
      [
        2,
        "E",
        "W"
      ],
      [
        3,
        "E",
        "W"
      ],
      [
        4,
        "S",
        "W"
      ],
      [
        5,
        "N",
        "S"
      ],
      [
        6,
        "E",
        "N"
      ],
      [
        7,
        "E",
        "S"
      ],
      [
        8,
        "E",
        "W"
      ],
      [
        9,
        "N",
        "W"
      ],
      [
        10,
        "N",
        "W"
      ],
      [
        11,
        "E",
        "N"
      ],
      [
        12,
        "E",
        "N"
      ],
      [
        13,
        "S",
        "W"
      ],
      [
        14,
        "E",
        "S"
      ],
      [
        15,
        "E",
        "N"
      ],
      [
        16,
        "E",
        "N"
      ],
      [
        17,
        "E",
        "N"
      ],
      [
        18,
        "E",
        "N"
      ],
      [
        19,
        "N",
        "W"
      ],
      [
        20,
        "E",
        "N"
      ],
      [
        21,
        "N",
        "S"
      ],
      [
        22,
        "E",
        "N"
      ],
      [
        23,
        "E",
        "N"
      ],
      [
        24,
        "E",
        "N"
      ]
    ],
    "initialRotations": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      3,
      3,
      3,
      0,
      0,
      3,
      3,
      0,
      0,
      0,
      0,
      3,
      3,
      0,
      0,
      0,
      0,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          15,
          16,
          11,
          12,
          7,
          8,
          9,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          4,
          4,
          3,
          3,
          1,
          3,
          3,
          3,
          0,
          3,
          0,
          3,
          3,
          0,
          0,
          0,
          0,
          0
        ],
        "paths": [
          [
            10,
            15,
            16,
            11,
            12,
            7,
            8,
            9,
            14
          ]
        ],
        "connected": [
          7,
          8,
          9,
          10,
          11,
          12,
          14,
          15,
          16
        ],
        "actions": [
          10,
          10,
          10,
          16,
          16,
          16,
          11,
          7,
          8,
          14,
          14,
          14
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          5,
          0,
          1,
          2,
          3,
          4,
          9,
          8,
          7,
          12,
          11,
          16,
          17,
          22,
          23,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          4,
          4,
          4,
          0,
          1,
          3,
          3,
          0,
          0,
          0,
          2,
          5,
          4,
          0,
          0,
          0,
          3,
          0
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            2,
            3,
            4,
            9,
            8,
            7,
            12,
            11,
            16,
            17,
            22,
            23,
            18,
            19,
            14
          ]
        ],
        "connected": [
          0,
          1,
          2,
          3,
          4,
          5,
          7,
          8,
          9,
          10,
          11,
          12,
          14,
          16,
          17,
          18,
          19,
          22,
          23
        ],
        "actions": [
          9,
          8,
          7,
          11,
          17,
          17,
          23,
          23,
          23,
          18,
          18
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          5,
          0,
          1,
          2,
          3,
          4,
          9,
          8,
          7,
          12,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          4,
          4,
          4,
          0,
          0,
          4,
          4,
          0,
          0,
          0,
          0,
          4,
          4,
          0,
          0,
          0,
          0,
          0
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            2,
            3,
            4,
            9,
            8,
            7,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          0,
          1,
          2,
          3,
          4,
          5,
          7,
          8,
          9,
          10,
          12,
          13,
          14,
          18,
          19
        ],
        "actions": [
          9,
          8,
          7,
          12,
          13,
          18
        ]
      }
    ],
    "routeStyle": "corridor",
    "displayNumber": 22,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false
  },
  {
    "id": 9,
    "name": "Далёкий отклик",
    "tutorial": false,
    "nextLevelId": 10,
    "size": 5,
    "requireClosedCircuit": true,
    "source": {
      "index": 10,
      "side": "W"
    },
    "goal": {
      "index": 14,
      "side": "E"
    },
    "stars": [
      21,
      2
    ],
    "hintRoute": [
      10,
      15,
      16,
      21,
      22,
      17,
      18,
      13,
      12,
      7,
      2,
      3,
      4,
      9,
      14
    ],
    "paths": [
      [
        10,
        15,
        16,
        21,
        22,
        17,
        18,
        13,
        12,
        7,
        2,
        3,
        4,
        9,
        14
      ]
    ],
    "switches": [
      {
        "index": 16,
        "linked": 4
      }
    ],
    "solution": [
      [
        0,
        "N",
        "E"
      ],
      [
        1,
        "N",
        "E"
      ],
      [
        2,
        "S",
        "E"
      ],
      [
        3,
        "W",
        "E"
      ],
      [
        4,
        "W",
        "S"
      ],
      [
        5,
        "N",
        "S"
      ],
      [
        6,
        "N",
        "S"
      ],
      [
        7,
        "S",
        "N"
      ],
      [
        8,
        "N",
        "E"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "N",
        "S"
      ],
      [
        12,
        "E",
        "N"
      ],
      [
        13,
        "S",
        "W"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "E"
      ],
      [
        16,
        "W",
        "S"
      ],
      [
        17,
        "S",
        "E"
      ],
      [
        18,
        "W",
        "N"
      ],
      [
        19,
        "N",
        "E"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23,
        "N",
        "S"
      ],
      [
        24,
        "N",
        "E"
      ]
    ],
    "initialRotations": [
      0,
      2,
      3,
      3,
      2,
      3,
      0,
      0,
      3,
      0,
      1,
      0,
      3,
      3,
      1,
      0,
      2,
      1,
      1,
      0,
      3,
      0,
      0,
      3,
      0
    ],
    "variants": [
      {
        "stars": 1,
        "path": [
          10,
          5,
          0,
          1,
          6,
          11,
          16,
          17,
          12,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          1,
          2,
          3,
          3,
          2,
          4,
          0,
          0,
          3,
          0,
          1,
          0,
          5,
          4,
          1,
          0,
          2,
          2,
          1,
          3,
          3,
          0,
          0,
          3,
          0
        ],
        "actions": [
          5,
          0,
          17,
          12,
          12,
          13,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            5,
            0,
            1,
            6,
            11,
            16,
            17,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          0,
          1,
          5,
          6,
          10,
          11,
          12,
          13,
          14,
          16,
          17,
          18,
          19
        ]
      },
      {
        "stars": 2,
        "path": [
          10,
          15,
          16,
          11,
          6,
          1,
          2,
          7,
          12,
          13,
          18,
          19,
          14
        ],
        "rotations": [
          0,
          5,
          5,
          3,
          5,
          3,
          0,
          0,
          3,
          0,
          4,
          0,
          4,
          4,
          1,
          0,
          5,
          1,
          1,
          3,
          3,
          0,
          0,
          3,
          0
        ],
        "actions": [
          10,
          10,
          10,
          16,
          16,
          16,
          1,
          1,
          1,
          2,
          2,
          12,
          13,
          19,
          19,
          19
        ],
        "paths": [
          [
            10,
            15,
            16,
            11,
            6,
            1,
            2,
            7,
            12,
            13,
            18,
            19,
            14
          ]
        ],
        "connected": [
          1,
          2,
          6,
          7,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          18,
          19
        ]
      },
      {
        "stars": 3,
        "path": [
          10,
          15,
          16,
          21,
          22,
          17,
          18,
          13,
          12,
          7,
          2,
          3,
          4,
          9,
          14
        ],
        "rotations": [
          0,
          2,
          4,
          4,
          4,
          3,
          0,
          0,
          3,
          0,
          4,
          0,
          4,
          4,
          4,
          0,
          4,
          4,
          4,
          0,
          3,
          0,
          0,
          3,
          0
        ],
        "actions": [
          10,
          10,
          10,
          16,
          16,
          17,
          17,
          17,
          18,
          18,
          18,
          13,
          12,
          2,
          3,
          14,
          14,
          14
        ],
        "paths": [
          [
            10,
            15,
            16,
            21,
            22,
            17,
            18,
            13,
            12,
            7,
            2,
            3,
            4,
            9,
            14
          ]
        ],
        "connected": [
          2,
          3,
          4,
          7,
          9,
          10,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          21,
          22
        ]
      }
    ],
    "routeStyle": "corridor",
    "displayNumber": 23,
    "chapter": 1,
    "hintsEnabled": true,
    "hintTutorial": false
  },
  {"id":10,"name":"Дальний рычаг","displayNumber":24,"chapter":1,"tutorial":false,"hintsEnabled":true,"hintTutorial":false},
  {"id":11,"name":"Подвижный обход","displayNumber":25,"chapter":1,"tutorial":false,"hintsEnabled":true,"hintTutorial":false},
  {"id":12,"name":"Двойное управление","displayNumber":26,"chapter":1,"tutorial":false,"hintsEnabled":true,"hintTutorial":false},
  {"id":45,"name":"Последний рубеж","displayNumber":27,"chapter":1,"tutorial":false,"hintsEnabled":true,"hintTutorial":false}
];

// These early routes deliberately change direction near both the transformer and the
// house. That keeps solving from either end equally useful without introducing a new
// mechanic before level 11.
const balancedEarlyRoutes = new Map([

  [6, [10, 15, 20, 21, 16, 17, 22, 23, 18, 13, 12, 7, 8, 3, 4, 9, 14]],
  [10, [10, 5, 0, 1, 6, 11, 16, 15, 20, 21, 22, 17, 12, 7, 2, 3, 4, 9, 8, 13, 18, 19, 14]],
]);
const earlyRouteDirection = (from, to) => {
  const distance = to - from;
  if (distance === -5) return 'N';
  if (distance === 5) return 'S';
  if (distance === -1) return 'W';
  if (distance === 1) return 'E';
  throw new Error(`Early route has non-adjacent cells: ${from} -> ${to}`);
};
const earlyRouteOpposite = { N: 'S', S: 'N', W: 'E', E: 'W' };
const earlyRouteCycle = (ports) =>
  ports.length === 2 &&
  ((ports.includes('N') && ports.includes('S')) ||
  (ports.includes('W') && ports.includes('E')))
    ? 2
    : 4;

for (const [displayNumber, route] of balancedEarlyRoutes) {
  const level = redesignedLevels.find((candidate) => candidate.displayNumber === displayNumber);
  if (!level) throw new Error(`Missing early level ${displayNumber}`);
  const solution = level.solution.map((cell) => [...cell]);
  route.forEach((index, position) => {
    const incoming =
      position === 0
        ? level.source.side
        : earlyRouteOpposite[earlyRouteDirection(route[position - 1], index)];
    const outgoing =
      position === route.length - 1
        ? level.goal.side
        : earlyRouteDirection(index, route[position + 1]);
    solution[index] = [index, incoming, outgoing];
  });

  const initialRotations = [...level.initialRotations];
  let elbowCount = 0;
  route.forEach((index, position) => {
    const cycle = earlyRouteCycle(solution[index].slice(1));
    initialRotations[index] = cycle === 2 ? (position % 2 ? 3 : 1) : ++elbowCount % 4 === 0 ? 2 : 3;
  });
  const solvedRotations = [...initialRotations];
  const actions = [];
  for (const index of route) {
    const cycle = earlyRouteCycle(solution[index].slice(1));
    while (solvedRotations[index] % cycle !== 0) {
      solvedRotations[index] += 1;
      actions.push(index);
    }
  }
  Object.assign(level, {
    hintRoute: route,
    paths: [route],
    solution,
    initialRotations,
    variants: [{ rotations: solvedRotations, actions }],
  });
}

// The second board offers a plausible detour from either inlet. Its only
// complete corridor needs twelve turns, versus nine in the previous version.
const revisedLevelTwo = redesignedLevels.find((level) => level.displayNumber === 2);
if (revisedLevelTwo) {
  const route = [10, 5, 0, 1, 6, 7, 12, 17, 18, 19, 14];
  const solution = [
    [0, 'S', 'E'], [1, 'W', 'S'], [2], [3, 'S', 'N'], [4],
    [5, 'S', 'N'], [6, 'N', 'E'], [7, 'W', 'S'], [8, 'E', 'N'], [9, 'S', 'W'],
    [10, 'W', 'N'], [11], [12, 'N', 'S'], [13], [14, 'S', 'E'],
    [15, 'N', 'S'], [16, 'S', 'N'], [17, 'N', 'E'], [18, 'W', 'E'], [19, 'W', 'N'],
    [20, 'N', 'E'], [21, 'W', 'N'], [22], [23], [24],
  ];
  const initialRotations = [3, 3, 0, 0, 0, 1, 2, 3, 0, 0, 3, 0, 1, 0, 3, 0, 0, 3, 1, 3, 0, 0, 0, 0, 0];
  const rotations = [...initialRotations], actions = [];
  for (const index of route) {
    const cycle = earlyRouteCycle(solution[index].slice(1));
    while (rotations[index] % cycle !== 0) { rotations[index]++; actions.push(index); }
  }
  Object.assign(revisedLevelTwo, {
    solution, initialRotations, hintRoute: route, paths: [route],
    variants: [{ stars: 1, rotations, actions, path: route, paths: [route] }],
  });
}

const revisedLevelSix = redesignedLevels.find((level) => level.displayNumber === 6);
if (revisedLevelSix) {
  const outagePath = [10, 5, 0, 1, 2, 3, 4, 9, 14];
  // This is a second board arrangement, not another target orientation for the
  // first one. The outage overlay hides the rebuild while pipes change cells.
  const outageSolution = Array.from({ length: revisedLevelSix.size ** 2 }, (_, index) => [index]);
  outagePath.forEach((index, position) => {
    const incoming = position === 0
      ? revisedLevelSix.source.side
      : earlyRouteOpposite[earlyRouteDirection(outagePath[position - 1], index)];
    const outgoing = position === outagePath.length - 1
      ? revisedLevelSix.goal.side
      : earlyRouteDirection(index, outagePath[position + 1]);
    outageSolution[index] = [index, incoming, outgoing];
  });
  // Cells 12 and 17 become empty while pipes move into the former gaps at 19 and
  // 24. Other off-route bodies are redistributed as plausible two-port decoys.
  for (const index of [6, 7, 8, 11, 13, 15, 16]) outageSolution[index] = [index, 'N', 'S'];
  for (const index of [18, 19, 20, 21, 22, 23, 24]) outageSolution[index] = [index, 'N', 'E'];
  const outageSolvedRotations = [
    0, 0, 0, 0, 0,
    0, 3, 0, 2, 0,
    0, 3, 0, 1, 0,
    1, 3, 0, 1, 0,
    1, 0, 3, 1, 2,
  ];
  const outageInitialRotations = [
    1, 1, 1, 1, 1,
    1, 3, 0, 2, 1,
    2, 3, 0, 1, 2,
    1, 3, 0, 1, 0,
    1, 0, 3, 1, 2,
  ];
  const outageActions = [10, 10, 5, 0, 0, 0, 1, 2, 3, 4, 4, 4, 9, 14, 14];
  revisedLevelSix.outage = {
    breakCell: 12,
    solution: outageSolution,
    initialRotations: outageInitialRotations,
    hintRoute: outagePath,
    variants: [{
      stars: 1,
      rotations: outageSolvedRotations,
      path: outagePath,
      paths: [outagePath],
      actions: outageActions,
    }],
  };
}

// Introduce the hint bulb on level 10. After three manual turns its familiar
// cloud offers one free demonstration and rotates the planned pipe for the
// player. Later levels retain ordinary paid hints without repeating the lesson.
const hintIntroLevel = redesignedLevels.find((level) => level.displayNumber === 10);
if (hintIntroLevel) {
  const variants = hintIntroLevel.variants.map((variant) => ({
    ...variant,
    stars: 3,
    path: hintIntroLevel.hintRoute,
    paths: [hintIntroLevel.hintRoute],
  }));
  Object.assign(hintIntroLevel, { hintsEnabled: true, hintTutorial: true, variants });
}

// Level 11 is a fresh weave around a relay near the upper-right corner.
// It reaches the lower channel from above, loops through the yard, then
// returns across the raised bridge; the other five pipes are two-port decoys.
const crossoverLevel = redesignedLevels.find((level) => level.displayNumber === 11);
if (crossoverLevel) {
  const path = [10, 15, 20, 21, 16, 11, 6, 1, 2, 3, 8, 13, 18, 23, 22, 17, 12, 7, 8, 9, 14];
  const solution = crossoverLevel.solution.map((cell) => [...cell]);
  path.forEach((index, position) => {
    if (index === 8) return;
    const incoming = position === 0
      ? crossoverLevel.source.side
      : earlyRouteOpposite[earlyRouteDirection(path[position - 1], index)];
    const outgoing = position === path.length - 1
      ? crossoverLevel.goal.side
      : earlyRouteDirection(index, path[position + 1]);
    solution[index] = [index, incoming, outgoing];
  });
  solution[8] = [8, 'N', 'E', 'S', 'W'];
  solution[0] = [0, 'N', 'E'];
  solution[4] = [4, 'S', 'W'];
  solution[5] = [5, 'N', 'E'];
  solution[19] = [19, 'N', 'W'];
  solution[24] = [24, 'N', 'S'];
  const initialRotations = solution.map((_, index) => ({ 0: 2, 4: 3, 19: 2, 24: 3 })[index] ?? 1);
  const activeCells = [...new Set(path)];
  const solvedRotations = [...initialRotations];
  const actions = [];
  for (const index of activeCells) {
    const cycle = earlyRouteCycle(solution[index].slice(1));
    while (solvedRotations[index] % cycle !== 0) {
      solvedRotations[index] += 1;
      actions.push(index);
    }
  }
  Object.assign(crossoverLevel, {
    intro: 'crossover',
    lessonCells: [8],
    crossovers: [8],
    sequentialCrossovers: [{ index: 8, first: ['N', 'S'], then: ['W', 'E'], rotation: 0, holdOpenUntilPulseEnds: true }],
    hintRoute: path,
    paths: [path],
    solution,
    initialRotations,
    variants: [{
      stars: 3,
      rotations: solvedRotations,
      path,
      paths: [path],
      actions,
    }],
  });
}

// Level 12 keeps the crossover away from the centre and makes both heights
// unavoidable. The route winds across the top, descends through the lower
// vertical channel, loops around the bottom, then returns over the horizontal
// bridge. The three elbow decoys cannot form an alternate source-to-house path.
const secondCrossoverLevel = redesignedLevels.find((level) => level.displayNumber === 12);
if (secondCrossoverLevel) {
  const path = [10, 11, 6, 1, 2, 3, 4, 9, 8, 13, 12, 17, 22, 21, 20, 15, 16, 17, 18, 23, 24, 19, 14];
  const solution = secondCrossoverLevel.solution.map((cell) => [...cell]);
  path.forEach((index, position) => {
    if (index === 17) return;
    const incoming = position === 0
      ? secondCrossoverLevel.source.side
      : earlyRouteOpposite[earlyRouteDirection(path[position - 1], index)];
    const outgoing = position === path.length - 1
      ? secondCrossoverLevel.goal.side
      : earlyRouteDirection(index, path[position + 1]);
    solution[index] = [index, incoming, outgoing];
  });
  solution[17] = [17, 'N', 'E', 'S', 'W'];
  solution[0] = [0, 'E', 'S'];
  solution[5] = [5, 'N', 'E'];
  solution[7] = [7, 'E', 'S'];

  const initialRotations = [
    2, 1, 1, 1, 1,
    3, 1, 2, 1, 1,
    1, 1, 1, 1, 1,
    1, 1, 2, 1, 1,
    1, 1, 1, 1, 1,
  ];
  const solvedRotations = [...initialRotations];
  const actions = [];
  for (const index of [...new Set(path)]) {
    const cycle = earlyRouteCycle(solution[index].slice(1));
    while (solvedRotations[index] % cycle !== 0) {
      solvedRotations[index] += 1;
      actions.push(index);
    }
  }

  Object.assign(secondCrossoverLevel, {
    name: 'Перекрёстный двор',
    timeLimitSeconds: 95,
    hintTutorial: false,
    intro: undefined,
    lessonCells: [],
    crossovers: [17],
    sequentialCrossovers: [{ index: 17, first: ['N', 'S'], then: ['W', 'E'], rotation: 0 }],
    hintRoute: path,
    paths: [path],
    solution,
    initialRotations,
    variants: [{
      stars: 3,
      rotations: solvedRotations,
      path,
      paths: [path],
      actions,
    }],
    outage: {
      breakCell: 13,
      turns: [[11, 3], [13, 3], [23, 3]],
    },
  });
}

// Level 13 keeps the first-star lesson, but its board now builds on the two
// preceding crossover puzzles. One corridor first crosses cell 13 through the
// isolated vertical channel, sweeps around the lower edge, then returns over
// the raised horizontal bridge to the house. Cells 15, 20 and 21 are
// believable two-port decoys; exhaustive geometric enumeration leaves only the
// authored transformer-to-house corridor.
const starCrossoverLevel = redesignedLevels.find((level) => level.displayNumber === 13);
if (starCrossoverLevel) {
  const path = [10, 5, 0, 1, 6, 7, 2, 3, 4, 9, 8, 13, 18, 19, 24, 23, 22, 17, 16, 11, 12, 13, 14];
  const solution = starCrossoverLevel.solution.map((cell) => [...cell]);
  path.forEach((index, position) => {
    if (index === 13) return;
    const incoming = position === 0
      ? starCrossoverLevel.source.side
      : earlyRouteOpposite[earlyRouteDirection(path[position - 1], index)];
    const outgoing = position === path.length - 1
      ? starCrossoverLevel.goal.side
      : earlyRouteDirection(index, path[position + 1]);
    solution[index] = [index, incoming, outgoing];
  });
  solution[13] = [13, 'N', 'E', 'S', 'W'];
  solution[15] = [15, 'N', 'S'];
  solution[20] = [20, 'E', 'W'];
  solution[21] = [21, 'N', 'S'];

  const initialRotations = solution.map((cell, index) => {
    if (index === 13) return 3;
    if (index === 15) return 1;
    if (index === 20) return 1;
    if (index === 21) return 3;
    return earlyRouteCycle(cell.slice(1)) === 2 && index % 2 ? 3 : 1;
  });
  const solvedRotations = [...initialRotations];
  const actions = [];
  for (const index of [...new Set(path)]) {
    const cycle = earlyRouteCycle(solution[index].slice(1));
    while (solvedRotations[index] % cycle !== 0) {
      solvedRotations[index] += 1;
      actions.push(index);
    }
  }

  Object.assign(starCrossoverLevel, {
    name: 'Звёздное переплетение',
    intro: 'stars',
    lessonStar: 22,
    stars: [22],
    crossovers: [13],
    sequentialCrossovers: [{ index: 13, first: ['N', 'S'], then: ['W', 'E'], rotation: 0 }],
    hintRoute: path,
    paths: [path],
    solution,
    initialRotations,
    variants: [{
      stars: 3,
      rotations: solvedRotations,
      path,
      paths: [path],
      actions,
    }],
  });
}

// Level 14 offers a short, starless route from either end. The longer route
// visits the star and passes the isolated relay twice: lower channel first,
// raised bridge only after the shutters have opened.
const harderStarCrossoverLevel = redesignedLevels.find((level) => level.displayNumber === 14);
if (harderStarCrossoverLevel) {
  const fullPath = [10, 5, 0, 1, 2, 3, 4, 9, 8, 7, 6, 11, 12, 13, 18, 23, 22, 21, 20, 15, 16, 17, 18, 19, 14];
  const bypassPath = [10, 15, 16, 17, 18, 19, 14];
  harderStarCrossoverLevel.source = { index: 10, side: 'W' };
  const solution = harderStarCrossoverLevel.solution.map((cell) => [...cell]);
  fullPath.forEach((index, position) => {
    if (index === 18) return;
    const incoming = position === 0
      ? harderStarCrossoverLevel.source.side
      : earlyRouteOpposite[earlyRouteDirection(fullPath[position - 1], index)];
    const outgoing = position === fullPath.length - 1
      ? harderStarCrossoverLevel.goal.side
      : earlyRouteDirection(index, fullPath[position + 1]);
    solution[index] = [index, incoming, outgoing];
  });
  solution[18] = [18, 'N', 'E', 'S', 'W'];
  solution[24] = [24];
  const initialRotations = solution.map((_, index) => index === 24 ? 0 : 1);

  const fullRotations = [...initialRotations], fullActions = [];
  for (const index of new Set(fullPath)) {
    const cycle = earlyRouteCycle(solution[index].slice(1));
    while (fullRotations[index] % cycle !== 0) {
      fullRotations[index]++;
      fullActions.push(index);
    }
  }
  const bypassRotations = [...initialRotations], bypassActions = [];
  bypassPath.forEach((index, position) => {
    const incoming = position === 0
      ? harderStarCrossoverLevel.source.side
      : earlyRouteOpposite[earlyRouteDirection(bypassPath[position - 1], index)];
    const outgoing = position === bypassPath.length - 1
      ? harderStarCrossoverLevel.goal.side
      : earlyRouteDirection(index, bypassPath[position + 1]);
    const ports = solution[index].slice(1), cycle = earlyRouteCycle(ports);
    while (![incoming, outgoing].every((side) => ports.map((port) =>
      ['N', 'E', 'S', 'W'][(['N', 'E', 'S', 'W'].indexOf(port) + bypassRotations[index]) % 4]
    ).includes(side))) {
      bypassRotations[index]++;
      bypassActions.push(index);
      if (bypassRotations[index] - initialRotations[index] >= cycle) throw new Error('Invalid level 14 bypass');
    }
  });
  Object.assign(harderStarCrossoverLevel, {
    stars: [2],
    crossovers: [18],
    sequentialCrossovers: [{ index: 18, first: ['N', 'S'], then: ['W', 'E'], rotation: 0 }],
    hintRoute: fullPath,
    paths: [fullPath, bypassPath],
    solution,
    initialRotations,
    variants: [
      { stars: 3, rotations: fullRotations, path: fullPath, paths: [fullPath], actions: fullActions },
      { stars: 2, rotations: bypassRotations, path: bypassPath, paths: [bypassPath], actions: bypassActions },
    ],
  });
}

// Level 16 introduces a single fixed straight pipe in the middle of the field.
// The lower and upper loops offer separate stars; only the full weave gets both.
const fixedMazeLevel = redesignedLevels.find((level) => level.displayNumber === 16);
if (fixedMazeLevel) {
  const fullPath = [10, 11, 16, 15, 20, 21, 22, 23, 18, 17, 12, 7, 6, 5, 0, 1, 2, 3, 4, 9, 8, 13, 14];
  const shortPath = [10, 11, 16, 17, 12, 7, 8, 13, 14];
  const lowerStarPath = [10, 11, 16, 15, 20, 21, 22, 23, 18, 17, 12, 7, 8, 13, 14];
  const upperStarPath = [10, 11, 16, 17, 12, 7, 6, 5, 0, 1, 2, 3, 4, 9, 8, 13, 14];
  const solution = fixedMazeLevel.solution.map((cell) => [...cell]);
  fullPath.forEach((index, position) => {
    const incoming = position === 0
      ? fixedMazeLevel.source.side
      : earlyRouteOpposite[earlyRouteDirection(fullPath[position - 1], index)];
    const outgoing = position === fullPath.length - 1
      ? fixedMazeLevel.goal.side
      : earlyRouteDirection(index, fullPath[position + 1]);
    solution[index] = [index, incoming, outgoing];
  });
  // The two remaining cells are plausible two-port decoys.
  solution[19] = [19, 'S', 'N'];
  solution[24] = [24, 'W', 'N'];
  const initialRotations = solution.map((cell, index) => {
    if (index === 12) return 0;
    if (index === 16 || index === 8) return 2;
    if (index === 17 || index === 7) return 1;
    return earlyRouteCycle(cell.slice(1)) === 2 ? 1 : (index % 4 === 0 ? 1 : index % 2 === 0 ? 2 : 3);
  });
  const sides = ['N', 'E', 'S', 'W'];
  const variant = (path, stars) => {
    const rotations = [...initialRotations], actions = [];
    path.forEach((index, position) => {
      const required = [
        position === 0 ? fixedMazeLevel.source.side : earlyRouteOpposite[earlyRouteDirection(path[position - 1], index)],
        position === path.length - 1 ? fixedMazeLevel.goal.side : earlyRouteDirection(index, path[position + 1]),
      ];
      const ports = solution[index].slice(1);
      while (!required.every((side) => ports.some((port) => sides[(sides.indexOf(port) + rotations[index]) % 4] === side))) {
        if (index === 12 || actions.filter((action) => action === index).length === 3)
          throw new Error(`Invalid fixed-pipe route at cell ${index}`);
        rotations[index]++;
        actions.push(index);
      }
    });
    return { stars, rotations, path, paths: [path], actions };
  };
  Object.assign(fixedMazeLevel, {
    name: 'Лабиринт на болтах',
    hintRoute: fullPath,
    paths: [shortPath, lowerStarPath, upperStarPath, fullPath],
    solution,
    initialRotations,
    variants: [variant(shortPath, 1), variant(lowerStarPath, 2), variant(upperStarPath, 2), variant(fullPath, 3)],
  });
}

// Applied first-attempt timing model. A break now caps the remaining charge
// at 30% of the level's initial timer, without reducing a smaller reserve.
const balancedLevelTimeSeconds = [25, 35, 45, 50, 70, 70, 70, 70, 75, 80, 100, 115, 90, 70, 75, 85, 110, 115];
for (const level of redesignedLevels) {
  if (level.displayNumber <= balancedLevelTimeSeconds.length)
    level.timeLimitSeconds = balancedLevelTimeSeconds[level.displayNumber - 1];
}

// Revised after the first external playtest. Every early field is filled with
// plausible two-port pipes. Later boards retain reward choices, but no longer
// offer the former seven-to-eleven-cell completion shortcuts.
const harderPlaytestBoards = [
  {
    "number": 7,
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "S"
      ],
      [
        2,
        "S",
        "E"
      ],
      [
        3,
        "W",
        "E"
      ],
      [
        4,
        "W",
        "S"
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "N",
        "E"
      ],
      [
        7,
        "W",
        "N"
      ],
      [
        8,
        "E",
        "S"
      ],
      [
        9,
        "N",
        "W"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "E",
        "S"
      ],
      [
        12,
        "E",
        "W"
      ],
      [
        13,
        "N",
        "W"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "N",
        "E"
      ],
      [
        17,
        "W",
        "S"
      ],
      [
        18,
        "S",
        "E"
      ],
      [
        19,
        "W",
        "N"
      ],
      [
        20,
        "N",
        "S"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "N",
        "E"
      ],
      [
        23,
        "W",
        "N"
      ],
      [
        24,
        "N",
        "E"
      ]
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        6,
        7,
        2,
        3,
        4,
        9,
        8,
        13,
        12,
        11,
        16,
        17,
        22,
        23,
        18,
        19,
        14
      ]
    ],
    "initialRotations": [
      3,
      2,
      1,
      3,
      3,
      3,
      3,
      3,
      1,
      1,
      3,
      2,
      1,
      3,
      3,
      3,
      3,
      3,
      1,
      1,
      1,
      2,
      1,
      3,
      2
    ],
    "timeLimitSeconds": 70
  },
  {
    "number": 8,
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "E"
      ],
      [
        2,
        "W",
        "S"
      ],
      [
        3,
        "S",
        "E"
      ],
      [
        4,
        "W",
        "S"
      ],
      [
        5,
        "S",
        "N"
      ],
      [
        6,
        "E",
        "S"
      ],
      [
        7,
        "N",
        "W"
      ],
      [
        8,
        "S",
        "N"
      ],
      [
        9,
        "N",
        "S"
      ],
      [
        10,
        "W",
        "N"
      ],
      [
        11,
        "N",
        "S"
      ],
      [
        12,
        "S",
        "E"
      ],
      [
        13,
        "W",
        "N"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "N",
        "S"
      ],
      [
        17,
        "E",
        "N"
      ],
      [
        18,
        "E",
        "W"
      ],
      [
        19,
        "S",
        "W"
      ],
      [
        20,
        "N",
        "S"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "W",
        "E"
      ],
      [
        23,
        "W",
        "E"
      ],
      [
        24,
        "W",
        "N"
      ]
    ],
    "paths": [
      [
        10,
        5,
        0,
        1,
        2,
        7,
        6,
        11,
        16,
        21,
        22,
        23,
        24,
        19,
        18,
        17,
        12,
        13,
        8,
        3,
        4,
        9,
        14
      ]
    ],
    "initialRotations": [
      1,
      1,
      1,
      3,
      2,
      1,
      1,
      1,
      3,
      1,
      1,
      1,
      1,
      3,
      2,
      1,
      0,
      3,
      3,
      1,
      3,
      2,
      3,
      1,
      2
    ],
    "timeLimitSeconds": 70
  },
  {
    "number": 9,
    "solution": [
      [
        0,
        "N",
        "S"
      ],
      [
        1,
        "S",
        "E"
      ],
      [
        2,
        "W",
        "E"
      ],
      [
        3,
        "W",
        "E"
      ],
      [
        4,
        "W",
        "S"
      ],
      [
        5,
        "N",
        "S"
      ],
      [
        6,
        "S",
        "N"
      ],
      [
        7,
        "E",
        "S"
      ],
      [
        8,
        "E",
        "W"
      ],
      [
        9,
        "N",
        "W"
      ],
      [
        10,
        "W",
        "S"
      ],
      [
        11,
        "S",
        "N"
      ],
      [
        12,
        "N",
        "E"
      ],
      [
        13,
        "W",
        "S"
      ],
      [
        14,
        "S",
        "E"
      ],
      [
        15,
        "N",
        "S"
      ],
      [
        16,
        "S",
        "N"
      ],
      [
        17,
        "E",
        "S"
      ],
      [
        18,
        "N",
        "W"
      ],
      [
        19,
        "S",
        "N"
      ],
      [
        20,
        "N",
        "E"
      ],
      [
        21,
        "W",
        "N"
      ],
      [
        22,
        "N",
        "E"
      ],
      [
        23,
        "W",
        "E"
      ],
      [
        24,
        "W",
        "N"
      ]
    ],
    "paths": [
      [
        10,
        15,
        20,
        21,
        16,
        11,
        6,
        1,
        2,
        3,
        4,
        9,
        8,
        7,
        12,
        13,
        18,
        17,
        22,
        23,
        24,
        19,
        14
      ]
    ],
    "initialRotations": [
      1,
      2,
      1,
      0,
      1,
      3,
      1,
      1,
      1,
      1,
      1,
      3,
      1,
      1,
      3,
      3,
      1,
      1,
      2,
      3,
      1,
      2,
      1,
      0,
      3
    ],
    "timeLimitSeconds": 75,
    "outage": {
      "breakCell": 11,
      "solution": [
        [
          0,
          "N",
          "E"
        ],
        [
          1,
          "S",
          "E"
        ],
        [
          2,
          "W",
          "S"
        ],
        [
          3,
          "N",
          "E"
        ],
        [
          4,
          "N",
          "S"
        ],
        [
          5,
          "S",
          "E"
        ],
        [
          6,
          "W",
          "N"
        ],
        [
          7,
          "N",
          "E"
        ],
        [
          8,
          "W",
          "S"
        ],
        [
          9,
          "N",
          "S"
        ],
        [
          10,
          "W",
          "N"
        ],
        [
          11,
          "E",
          "S"
        ],
        [
          12,
          "E",
          "W"
        ],
        [
          13,
          "N",
          "W"
        ],
        [
          14,
          "S",
          "E"
        ],
        [
          15,
          "E",
          "S"
        ],
        [
          16,
          "N",
          "W"
        ],
        [
          17,
          "S",
          "E"
        ],
        [
          18,
          "W",
          "S"
        ],
        [
          19,
          "S",
          "N"
        ],
        [
          20,
          "N",
          "E"
        ],
        [
          21,
          "W",
          "E"
        ],
        [
          22,
          "W",
          "N"
        ],
        [
          23,
          "N",
          "E"
        ],
        [
          24,
          "W",
          "N"
        ]
      ],
      "initialRotations": [
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        0,
        0,
        0,
        3,
        0,
        0,
        0,
        0,
        0,
        0,
        1
      ],
      "hintRoute": [
        10,
        5,
        6,
        1,
        2,
        7,
        8,
        13,
        12,
        11,
        16,
        15,
        20,
        21,
        22,
        17,
        18,
        23,
        24,
        19,
        14
      ]
    }
  },
  {
    "number": 17,
    "size": 6,
    "source": {
      "index": 12,
      "side": "W"
    },
    "goal": {
      "index": 17,
      "side": "E"
    },
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "E"
      ],
      [
        2,
        "W",
        "S"
      ],
      [
        3,
        "E",
        "S"
      ],
      [
        4,
        "S",
        "W"
      ],
      [
        5,
        "N",
        "S"
      ],
      [
        6,
        "S",
        "N"
      ],
      [
        7,
        "E",
        "S"
      ],
      [
        8,
        "N",
        "E",
        "S",
        "W"
      ],
      [
        9,
        "N",
        "W"
      ],
      [
        10,
        "S",
        "N"
      ],
      [
        11,
        "N",
        "S"
      ],
      [
        12,
        "W",
        "N"
      ],
      [
        13,
        "N",
        "S"
      ],
      [
        14,
        "N",
        "E"
      ],
      [
        15,
        "W",
        "S"
      ],
      [
        16,
        "S",
        "N"
      ],
      [
        17,
        "S",
        "E"
      ],
      [
        18,
        "N",
        "S"
      ],
      [
        19,
        "N",
        "E"
      ],
      [
        20,
        "W",
        "S"
      ],
      [
        21,
        "N",
        "E"
      ],
      [
        22,
        "W",
        "N"
      ],
      [
        23,
        "S",
        "N"
      ],
      [
        24,
        "N",
        "S"
      ],
      [
        25,
        "E",
        "S"
      ],
      [
        26,
        "N",
        "W"
      ],
      [
        27,
        "S",
        "E"
      ],
      [
        28,
        "W",
        "S"
      ],
      [
        29,
        "S",
        "N"
      ],
      [
        30,
        "N",
        "S"
      ],
      [
        31,
        "N",
        "E"
      ],
      [
        32,
        "W",
        "E"
      ],
      [
        33,
        "W",
        "N"
      ],
      [
        34,
        "N",
        "E"
      ],
      [
        35,
        "W",
        "N"
      ]
    ],
    "paths": [
      [
        12,
        6,
        0,
        1,
        2,
        8,
        14,
        15,
        9,
        8,
        7,
        13,
        19,
        20,
        26,
        25,
        31,
        32,
        33,
        27,
        28,
        34,
        35,
        29,
        23,
        17
      ],
      [
        12,
        6,
        0,
        1,
        2,
        8,
        14,
        15,
        21,
        22,
        16,
        10,
        4,
        3,
        9,
        8,
        7,
        13,
        19,
        20,
        26,
        25,
        31,
        32,
        33,
        27,
        28,
        34,
        35,
        29,
        23,
        17
      ],
      [
        12,
        6,
        0,
        1,
        2,
        8,
        14,
        15,
        21,
        20,
        26,
        25,
        31,
        32,
        33,
        27,
        28,
        34,
        35,
        29,
        23,
        17
      ]
    ],
    "initialRotations": [
      2,
      0,
      1,
      2,
      1,
      3,
      1,
      1,
      1,
      1,
      1,
      3,
      1,
      3,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      1,
      1,
      3,
      1,
      1,
      3,
      1,
      1,
      3,
      1,
      1,
      1,
      2,
      1,
      1
    ],
    "timeLimitSeconds": 120,
    "fixed": [
      1
    ],
    "stars": [
      3,
      19
    ],
    "crossovers": [
      8
    ],
    "sequentialCrossovers": [
      {
        "index": 8,
        "first": [
          "N",
          "S"
        ],
        "then": [
          "W",
          "E"
        ],
        "rotation": 0
      }
    ]
  },
  {
    "number": 18,
    "size": 6,
    "source": {
      "index": 12,
      "side": "W"
    },
    "goal": {
      "index": 17,
      "side": "E"
    },
    "solution": [
      [
        0,
        "S",
        "E"
      ],
      [
        1,
        "W",
        "E"
      ],
      [
        2,
        "W",
        "E"
      ],
      [
        3,
        "W",
        "E"
      ],
      [
        4,
        "W",
        "E"
      ],
      [
        5,
        "W",
        "S"
      ],
      [
        6,
        "S",
        "N"
      ],
      [
        7,
        "S",
        "E"
      ],
      [
        8,
        "W",
        "E"
      ],
      [
        9,
        "W",
        "S"
      ],
      [
        10,
        "E",
        "S"
      ],
      [
        11,
        "N",
        "W"
      ],
      [
        12,
        "W",
        "N"
      ],
      [
        13,
        "E",
        "N"
      ],
      [
        14,
        "E",
        "W"
      ],
      [
        15,
        "N",
        "E",
        "S",
        "W"
      ],
      [
        16,
        "N",
        "W"
      ],
      [
        17,
        "S",
        "E"
      ],
      [
        18,
        "N",
        "S"
      ],
      [
        19,
        "E",
        "S"
      ],
      [
        20,
        "S",
        "W"
      ],
      [
        21,
        "N",
        "S"
      ],
      [
        22,
        "S",
        "E"
      ],
      [
        23,
        "W",
        "N"
      ],
      [
        24,
        "E",
        "S"
      ],
      [
        25,
        "N",
        "W"
      ],
      [
        26,
        "E",
        "N"
      ],
      [
        27,
        "N",
        "W"
      ],
      [
        28,
        "E",
        "N"
      ],
      [
        29,
        "S",
        "W"
      ],
      [
        30,
        "N",
        "E"
      ],
      [
        31,
        "W",
        "E"
      ],
      [
        32,
        "W",
        "E"
      ],
      [
        33,
        "W",
        "E"
      ],
      [
        34,
        "W",
        "E"
      ],
      [
        35,
        "W",
        "N"
      ]
    ],
    "paths": [
      [
        12,
        6,
        0,
        1,
        2,
        3,
        4,
        5,
        11,
        10,
        16,
        15,
        14,
        13,
        7,
        8,
        9,
        15,
        21,
        27,
        28,
        22,
        23,
        17
      ],
      [
        12,
        6,
        0,
        1,
        2,
        3,
        4,
        5,
        11,
        10,
        16,
        15,
        14,
        13,
        7,
        8,
        9,
        15,
        21,
        27,
        26,
        20,
        19,
        25,
        24,
        30,
        31,
        32,
        33,
        34,
        35,
        29,
        28,
        22,
        23,
        17
      ],
      [
        12,
        18,
        24,
        25,
        19,
        20,
        26,
        27,
        21,
        15,
        9,
        8,
        7,
        13,
        14,
        15,
        16,
        10,
        11,
        17
      ],
      [
        12,
        18,
        24,
        25,
        19,
        20,
        26,
        27,
        21,
        15,
        9,
        8,
        7,
        13,
        14,
        15,
        16,
        22,
        23,
        17
      ]
    ],
    "initialRotations": [
      2,
      0,
      3,
      1,
      3,
      1,
      3,
      2,
      3,
      1,
      2,
      1,
      1,
      3,
      3,
      0,
      1,
      2,
      3,
      1,
      2,
      1,
      1,
      3,
      1,
      1,
      1,
      2,
      1,
      1,
      2,
      1,
      3,
      1,
      3,
      1
    ],
    "timeLimitSeconds": 140,
    "fixed": [
      1
    ],
    "stars": [
      0,
      29
    ],
    "crossovers": [
      15
    ],
    "sequentialCrossovers": [
      {
        "index": 15,
        "first": [
          "N",
          "S"
        ],
        "then": [
          "W",
          "E"
        ],
        "rotation": 0
      }
    ],
    "outage": {
      "breakCell": 15,
      "turns": [
        [
          12,
          1
        ],
        [
          15,
          3
        ],
        [
          16,
          2
        ],
        [
          17,
          1
        ]
      ]
    }
  },
  {
    "number": 19,
    "size": 6,
    "source": {
      "index": 12,
      "side": "W"
    },
    "goal": {
      "index": 17,
      "side": "E"
    },
    "solution": [
      [
        0,
        "E",
        "S"
      ],
      [
        1,
        "E",
        "W"
      ],
      [
        2,
        "S",
        "W"
      ],
      [
        3,
        "S",
        "E"
      ],
      [
        4,
        "W",
        "E"
      ],
      [
        5,
        "W",
        "S"
      ],
      [
        6,
        "N",
        "E"
      ],
      [
        7,
        "W",
        "E"
      ],
      [
        8,
        "N",
        "E",
        "S",
        "W"
      ],
      [
        9,
        "W",
        "N"
      ],
      [
        10,
        "E",
        "S"
      ],
      [
        11,
        "N",
        "W"
      ],
      [
        12,
        "W",
        "E"
      ],
      [
        13,
        "W",
        "E"
      ],
      [
        14,
        "N",
        "E",
        "S",
        "W"
      ],
      [
        15,
        "W",
        "S"
      ],
      [
        16,
        "N",
        "S"
      ],
      [
        17,
        "S",
        "E"
      ],
      [
        18,
        "E",
        "S"
      ],
      [
        19,
        "S",
        "W"
      ],
      [
        20,
        "E",
        "N"
      ],
      [
        21,
        "N",
        "W"
      ],
      [
        22,
        "N",
        "S"
      ],
      [
        23,
        "S",
        "N"
      ],
      [
        24,
        "N",
        "S"
      ],
      [
        25,
        "E",
        "N"
      ],
      [
        26,
        "E",
        "W"
      ],
      [
        27,
        "E",
        "W"
      ],
      [
        28,
        "N",
        "W"
      ],
      [
        29,
        "S",
        "N"
      ],
      [
        30,
        "N",
        "E"
      ],
      [
        31,
        "W",
        "E"
      ],
      [
        32,
        "W",
        "E"
      ],
      [
        33,
        "W",
        "E"
      ],
      [
        34,
        "W",
        "E"
      ],
      [
        35,
        "W",
        "N"
      ]
    ],
    "paths": [
      [
        12,
        13,
        14,
        15,
        9,
        10,
        16,
        22,
        28,
        27,
        26,
        25,
        19,
        18,
        24,
        30,
        31,
        32,
        33,
        34,
        35,
        29,
        23,
        17
      ],
      [
        12,
        13,
        14,
        15,
        9,
        8,
        7,
        6,
        0,
        1,
        2,
        8,
        14,
        20,
        19,
        25,
        26,
        27,
        28,
        22,
        16,
        10,
        11,
        17
      ],
      [
        12,
        13,
        14,
        15,
        21,
        20,
        14,
        8,
        2,
        3,
        9,
        10,
        16,
        22,
        28,
        27,
        26,
        25,
        19,
        18,
        24,
        30,
        31,
        32,
        33,
        34,
        35,
        29,
        23,
        17
      ],
      [
        12,
        13,
        14,
        15,
        21,
        20,
        14,
        8,
        2,
        1,
        0,
        6,
        7,
        8,
        9,
        3,
        4,
        5,
        11,
        10,
        16,
        22,
        28,
        27,
        26,
        25,
        19,
        18,
        24,
        30,
        31,
        32,
        33,
        34,
        35,
        29,
        23,
        17
      ]
    ],
    "initialRotations": [
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      3,
      1,
      2,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      3,
      1,
      1,
      1,
      3,
      1,
      3,
      1,
      3,
      1,
      3,
      1,
      1
    ],
    "timeLimitSeconds": 160,
    "fixed": [
      1
    ],
    "stars": [
      5,
      21
    ],
    "crossovers": [
      8,
      14
    ],
    "sequentialCrossovers": [
      {
        "index": 8,
        "first": [
          "N",
          "S"
        ],
        "then": [
          "W",
          "E"
        ],
        "rotation": 0
      },
      {
        "index": 14,
        "first": [
          "N",
          "S"
        ],
        "then": [
          "W",
          "E"
        ],
        "rotation": 0
      }
    ],
    "outage": {
      "breakCell": 14,
      "turns": [
        [
          12,
          1
        ],
        [
          8,
          3
        ],
        [
          14,
          1
        ],
        [
          13,
          3
        ],
        [
          17,
          2
        ]
      ]
    }
  }
];
const difficultyDirection = (level, from, to) => {
  if (to - from === -level.size) return 'N';
  if (to - from === level.size) return 'S';
  if (to - from === -1) return 'W';
  if (to - from === 1) return 'E';
  throw new Error('Non-adjacent revised route');
};
const difficultySides = ['N', 'E', 'S', 'W'];
function difficultyVariant(level, path) {
  const rotations = [...level.initialRotations], actions = [];
  for (const [position, index] of path.entries()) {
    if (path.indexOf(index) !== position) continue;
    const incoming = position === 0 ? level.source.side : earlyRouteOpposite[difficultyDirection(level, path[position - 1], index)];
    const outgoing = position === path.length - 1 ? level.goal.side : difficultyDirection(level, index, path[position + 1]);
    const relay = (level.crossovers ?? []).includes(index);
    const targetAxis = incoming === 'N' || incoming === 'S' ? 0 : 1;
    const matches = () => relay ? rotations[index] % 2 === targetAxis : [incoming, outgoing].every(side =>
      level.solution[index].slice(1).some(port => difficultySides[(difficultySides.indexOf(port) + rotations[index]) % 4] === side));
    while (!matches()) {
      if ((level.fixed ?? []).includes(index) || actions.filter(cell => cell === index).length === 3)
        throw new Error('Invalid revised level ' + level.displayNumber + ' at ' + index);
      rotations[index]++; actions.push(index);
    }
  }
  return { stars: 1 + level.stars.filter(index => path.includes(index)).length, rotations, actions, path, paths: [path] };
}
for (const board of harderPlaytestBoards) {
  const level = redesignedLevels.find(item => item.displayNumber === board.number);
  const { number, ...authored } = board;
  Object.assign(level, authored, { houseEntryGap: false });
  const variants = board.paths.map(path => difficultyVariant(level, path)).sort((a,b) => a.stars-b.stars || a.actions.length-b.actions.length);
  level.variants = variants;
  level.hintRoute = variants.at(-1).path;
  level.paths = variants.map(variant => variant.path);
  if (level.outage?.solution) {
    const post = { ...level, solution: level.outage.solution, initialRotations: level.outage.initialRotations };
    level.outage.variants = [difficultyVariant(post, level.outage.hintRoute)];
  }
}

// The retained ninth board follows the eighth board's outage with a larger
// maze. Both ends open onto long false corridors; only the 34-cell winding
// route can reach the house without a loose end.
const ninthLevel = redesignedLevels.find(level => level.id === 43);
if (ninthLevel) {
  const route = [12,6,0,1,2,3,4,5,11,10,9,15,16,22,21,27,26,20,14,8,7,13,19,25,24,30,31,32,33,34,28,29,23,17];
  const solution = Array.from({ length: 36 }, (_, index) => [index]);
  Object.assign(ninthLevel, { size: 6, source: { index: 12, side: 'W' }, goal: { index: 17, side: 'E' }, timeLimitSeconds: 75 });
  for (const [position, index] of route.entries()) {
    const incoming = position === 0 ? ninthLevel.source.side : earlyRouteOpposite[difficultyDirection(ninthLevel, route[position - 1], index)];
    const outgoing = position === route.length - 1 ? ninthLevel.goal.side : difficultyDirection(ninthLevel, index, route[position + 1]);
    solution[index] = [index, incoming, outgoing];
  }
  solution[18] = [18, 'N', 'E'];
  solution[35] = [35, 'W', 'E'];
  const initialRotations = [1,1,1,1,1,1,1,1,1,0,0,3,3,1,1,0,0,3,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0];
  Object.assign(ninthLevel, { solution, initialRotations, hintRoute: route, paths: [route] });
  ninthLevel.variants = [difficultyVariant(ninthLevel, route)];
}

applyUndergroundBoards(redesignedLevels);
applyLateBoards(redesignedLevels);

// Before collectible chambers appear, completing a board awards one star.
// The first single chamber raises the available result to two; two chambers
// from level 15 onward retain the established three-star ceiling.
for (const level of redesignedLevels) {
  if (level.displayNumber < 13) {
    level.completionStars = 1;
    if (level.variants) level.variants = level.variants.map((variant) => ({ ...variant, stars: 1 }));
  } else if (level.displayNumber < 15) {
    level.baseStars = 1;
    if (level.variants) level.variants = level.variants.map((variant) => ({
      ...variant,
      stars: Math.max(1, (variant.stars ?? 3) - 1),
    }));
  }
}

// Once the hint bulb is introduced on visible level 10 it remains part of the
// player's tool row for every later board. Only level 10 repeats the free-demo
// tutorial; subsequent levels use the normal hint balance and planner.
for (const level of redesignedLevels) {
  if (level.displayNumber >= 10) level.hintsEnabled = true;
}

// Retire the former fifth board after applying the authored mechanic overrides.
// Keep stable save IDs, clocks and lessons attached to their original boards.

for (const [index, level] of redesignedLevels.entries()) {
  if (level.timeLimitSeconds == null) level.timeLimitSeconds = 155;
  level.displayNumber = index + 1;
  level.nextLevelId = redesignedLevels[index + 1]?.id ?? null;
}
applyMiddleBoards(redesignedLevels);
