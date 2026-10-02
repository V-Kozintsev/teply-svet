// Authored continuations of chapter one. Each path includes both hatch mouths;
// non-adjacent consecutive mouths are one isolated underground connection.
const undergroundBoards = [
  {
    "number": 20,
    "name": "Подземный ход",
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
        "W"
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
        "N"
      ],
      [
        13,
        "S",
        "N"
      ],
      [
        14,
        "E",
        "S"
      ],
      [
        15,
        "E",
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
        "W",
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
        "S",
        "N"
      ],
      [
        25,
        "E"
      ],
      [
        26,
        "W",
        "S"
      ],
      [
        27,
        "N",
        "S"
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
        "E",
        "N"
      ],
      [
        31,
        "E",
        "W"
      ],
      [
        32,
        "N",
        "W"
      ],
      [
        33,
        "N",
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
        12,18,19,13,7,8,9,3,4,5,11,10,16,15,14,20,21,27,33,34,35,29,28,22,23,17
      ],
      [
        12,
        6,
        0,
        1,
        25,
        26,
        32,
        31,
        30,
        24,
        18,
        19,
        13,
        7,
        8,
        9,
        3,
        4,
        5,
        11,
        10,
        16,
        15,
        14,
        20,
        21,
        27,
        33,
        34,
        35,
        29,
        28,
        22,
        23,
        17
      ]
    ],
    "fixed": [
      26,
      27,
      32
    ],
    "stars": [
      0,
      5
    ],
    "crossovers": [],
    "sequentialCrossovers": [],
    "hatches": [
      {
        "a": 1,
        "b": 25,
        "symbol": "diamond"
      }
    ],
    "sliders": [],
    "switches": [],
    "intro": "tunnel",
    "hatchArtStyle": "mockup",
    "lessonCells": [
      1,
      25
    ],
    "timeLimitSeconds": 130,
    "outage": null,
    "houseEntryGap": false
  },
  {
    "number": 21,
    "name": "Подземное переплетение",
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
        "N",
        "S"
      ],
      [
        4,
        "E"
      ],
      [
        5,
        "W",
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
        "W"
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
        "E",
        "W"
      ],
      [
        10,
        "E",
        "W"
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
        "E"
      ],
      [
        17,
        "W",
        "E"
      ],
      [
        18,
        "E",
        "S"
      ],
      [
        19,
        "N",
        "W"
      ],
      [
        20,
        "S",
        "E"
      ],
      [
        21,
        "N",
        "E",
        "S",
        "W"
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
      ],
      [
        25,
        "N",
        "S"
      ],
      [
        26,
        "S",
        "N"
      ],
      [
        27,
        "N",
        "E"
      ],
      [
        28,
        "W",
        "E"
      ],
      [
        29,
        "W",
        "S"
      ],
      [
        30,
        "N",
        "E"
      ],
      [
        31,
        "W"
      ],
      [
        32,
        "E",
        "N"
      ],
      [
        33,
        "E",
        "W"
      ],
      [
        34,
        "E",
        "W"
      ],
      [
        35,
        "N",
        "W"
      ]
    ],
    "paths": [
      [
        12,
        13,
        19,
        18,
        24,
        30,
        31,
        4,
        5,
        11,
        10,
        9,
        8,
        7,
        6,
        0,
        1,
        2,
        8,
        14,
        15,
        21,
        27,
        28,
        29,
        35,
        34,
        33,
        32,
        26,
        20,
        21,
        22,
        16,
        17
      ],
      [
        12,
        13,
        19,
        18,
        24,
        30,
        31,
        4,
        3,
        2,
        8,
        14,
        15,
        21,
        27,
        28,
        29,
        35,
        34,
        33,
        32,
        26,
        20,
        21,
        22,
        16,
        17
      ]
    ],
    "fixed": [
      10
    ],
    "stars": [
      0,
      15
    ],
    "crossovers": [
      8,
      21
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
        "index": 21,
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
    "hatches": [
      {
        "a": 4,
        "b": 31,
        "symbol": "diamond"
      }
    ],
    "sliders": [],
    "switches": [],
    "intro": null,
    "hatchArtStyle": "mockup",
    "lessonCells": [],
    "timeLimitSeconds": 160,
    "outage": null,
    "houseEntryGap": false
  },
  {
    "number": 22,
    "name": "Две тайные линии",
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
        "W"
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
        "E"
      ],
      [
        11,
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
        "S",
        "E"
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
        "N",
        "E",
        "S",
        "W"
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
        "S",
        "N"
      ],
      [
        25,
        "N",
        "S"
      ],
      [
        26,
        "N",
        "S"
      ],
      [
        27,
        "N",
        "E"
      ],
      [
        28,
        "W"
      ],
      [
        29,
        "S",
        "N"
      ],
      [
        30,
        "N"
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
        8,
        7,
        6,
        0,
        1,
        2,
        8,
        14,
        20,
        21,
        22,
        16,
        10,
        11,
        30,
        24,
        18,
        19,
        25,
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
        21,
        22,
        28,
        4,
        10,
        11,
        30,
        24,
        18,
        19,
        25,
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
        31,
        30,
        11,
        17
      ],
      [
        12,
        13,
        14,
        15,
        21,
        27,
        28,
        4,
        10,
        11,
        30,
        24,
        18,
        19,
        25,
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
        27,
        28,
        4,
        10,
        9,
        3,
        2,
        8,
        14,
        20,
        19,
        25,
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
        27,
        28,
        4,
        10,
        9,
        3,
        2,
        8,
        14,
        20,
        19,
        25,
        31,
        30,
        11,
        17
      ],
      [
        12,
        13,
        14,
        15,
        21,
        27,
        28,
        4,
        3,
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
        21,
        22,
        16,
        10,
        11,
        30,
        24,
        18,
        19,
        25,
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
        27,
        28,
        4,
        3,
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
        27,
        28,
        4,
        3,
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
        31,
        30,
        11,
        17
      ]
    ],
    "fixed": [
      1,
      7
    ],
    "stars": [
      3,
      18
    ],
    "crossovers": [
      8,
      14,
      21
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
      },
      {
        "index": 21,
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
    "hatches": [
      {
        "a": 4,
        "b": 28,
        "symbol": "diamond"
      },
      {
        "a": 11,
        "b": 30,
        "symbol": "triangle"
      }
    ],
    "sliders": [],
    "switches": [],
    "intro": null,
    "lessonCells": [],
    "timeLimitSeconds": 200,
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
          21,
          3
        ],
        [
          15,
          2
        ],
        [
          17,
          1
        ]
      ]
    },
    "houseEntryGap": false
  },
  {
    "number": 23,
    "name": "Труба на салазках",
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
        "N",
        "S"
      ],
      [
        4,
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
        "E",
        "W"
      ],
      [
        10,
        "S",
        "W"
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
        "E"
      ],
      [
        16,
        "W",
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
        "N",
        "W"
      ],
      [
        20,
        "W",
        "E"
      ],
      [
        21,
        "S",
        "E"
      ],
      [
        22,
        "W",
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
      ],
      [
        25,
        "W",
        "E"
      ],
      [
        26
      ],
      [
        27,
        "W",
        "N"
      ],
      [
        28,
        "N",
        "E"
      ],
      [
        29,
        "W",
        "S"
      ],
      [
        30,
        "N",
        "S"
      ],
      [
        31,
        "E"
      ],
      [
        32,
        "E",
        "W"
      ],
      [
        33,
        "E",
        "W"
      ],
      [
        34,
        "E",
        "W"
      ],
      [
        35,
        "N",
        "W"
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
        16,
        10,
        9,
        8,
        7,
        13,
        19,
        18,
        24,
        25,
        26,
        27,
        21,
        22,
        28,
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
        16,
        10,
        9,
        8,
        7,
        13,
        19,
        18,
        24,
        25,
        26,
        27,
        21,
        22,
        28,
        29,
        35,
        34,
        33,
        32,
        31,
        4,
        5,
        11,
        17
      ]
    ],
    "fixed": [
      25
    ],
    "stars": [
      0,
      5
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
    ],
    "hatches": [
      {
        "a": 4,
        "b": 31,
        "symbol": "diamond"
      }
    ],
    "sliders": [
      {
        "index": 20,
        "slot": 26
      }
    ],
    "switches": [],
    "intro": "slider",
    "lessonCells": [
      20,
      26
    ],
    "timeLimitSeconds": 170,
    "outage": null,
    "houseEntryGap": false
  }
];
const lineSides=['N','E','S','W'],lineOpposite={N:'S',E:'W',S:'N',W:'E'};
function lineDirection(size,from,to){const d=to-from;return d===-size?'N':d===size?'S':d===-1?'W':d===1?'E':null;}
function fixedHatchesFitPath(level,path){
 const peers=new Map(level.hatches.flatMap(pair=>[[pair.a,pair.b],[pair.b,pair.a]]));
 return path.every((index,k)=>{
  if(!peers.has(index))return true;
  const side=path[k-1]===peers.get(index)?lineDirection(level.size,index,path[k+1]):lineOpposite[lineDirection(level.size,path[k-1],index)];
  return side===level.solution[index][1];
 });
}
function lineVariant(level,path,initial){
 const rotations=[...initial],actions=[],hatches=new Map(level.hatches.flatMap(p=>[[p.a,p.b],[p.b,p.a]])),slide=level.sliders[0];
 if(slide){const position=path.includes(slide.slot)?1:0;if(rotations[slide.index]%2!==position){rotations[slide.index]++;actions.push(slide.index);}}
 for(const [k,index]of path.entries()){
  if(path.indexOf(index)!==k)continue;
  const control=slide&&index===slide.slot?slide.index:index,ports=level.solution[control].slice(1),incoming=k===0?level.source.side:lineOpposite[lineDirection(level.size,path[k-1],index)],outgoing=k===path.length-1?level.goal.side:lineDirection(level.size,index,path[k+1]);
  let needed=hatches.has(index)?[path[k-1]===hatches.get(index)?outgoing:incoming]:[incoming,outgoing];
  if(needed.some(side=>!side))throw new Error('Invalid underground adjacency '+level.number+' at '+index);
  const relay=level.crossovers.includes(index),axis=incoming==='N'||incoming==='S'?0:1;
  const matches=()=>relay?rotations[control]%2===axis:needed.every(side=>ports.some(port=>lineSides[(lineSides.indexOf(port)+(slide&&control===slide.index?0:rotations[control]))%4]===side));
  while(!matches()){
   if(level.fixed.includes(control)||actions.filter(i=>i===control).length>=3)throw new Error('Unreachable authored route at '+index);
   rotations[control]++;actions.push(control);
  }
 }
 return {path,paths:[path],rotations,actions,stars:1+level.stars.filter(i=>path.includes(i)).length};
}
export function applyUndergroundBoards(levels){
 for(const board of undergroundBoards){
  // The open hatches are fixed exits. Only the surrounding pipes are assembled.
  board.fixed=[...new Set([...board.fixed,...board.hatches.flatMap(pair=>[pair.a,pair.b])])];
  const level=levels.find(l=>l.displayNumber===board.number),{number,...authored}=board;
  Object.assign(level,authored,{requireClosedCircuit:true});
    const canonical=lineVariant(board,board.paths.find(path=>board.stars.every(index=>path.includes(index))),Array(36).fill(0)).rotations;
  // The introductory boards mix short and long turns. The later two require
  // substantial assembly as well as tracing through remote hatch pairs.
  board.initialRotations=board.solution.map(([index,...ports])=>{
   if(board.fixed.includes(index))return 0;if(!ports.length)return 0;
   if(board.sliders.some(s=>s.index===index))return 0;
   if(board.crossovers.includes(index))return (canonical[index]+1)%2;
   const elbow=ports.length===2&&lineOpposite[ports[0]]!==ports[1];
   const cost=number===21||number===22?(elbow||ports.length===1?3:1):ports.length===1||elbow?1+(index*7+number)%3:1;
   return (canonical[index]-cost+4)%4;
  });
  level.initialRotations=[...board.initialRotations];
  level.variants=board.paths.filter(path=>fixedHatchesFitPath(board,path)).map(path=>lineVariant(board,path,board.initialRotations)).sort((a,b)=>a.stars-b.stars||a.actions.length-b.actions.length);
  level.paths=level.variants.map(v=>v.path);level.hintRoute=level.variants.at(-1).path;
 }
}
