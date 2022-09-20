/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

 var inputs: string[] = readline().split(' ');
 const L: number = parseInt(inputs[0]);
 const C: number = parseInt(inputs[1]);
 const map: string[][] = [];
 for (let i = 0; i < L; i++) {
     const row: string = readline();
     const line: string[] = []
     for(let j = 0; j < row.length; j++) {
         line.push(row[j]);
     }
     map.push(line);
 }
 
 enum Place {
     START = '@',
     SUICIDE = '$',
     OBSTACLE = '#',
     BREAKABLE = 'X', // BREAKABLE OBSTACLE
     BEER = 'B', // ENTER/EXIT BREAKER MODE
     TELEPORT = 'T',
     INVERT = 'I',
     SOUTH = 'S',
     EAST = 'E',
     NORTH = 'N',
     WEST = 'W',
     EMPTY = ' ',
 }
 
 enum Direction {
     SOUTH,
     EAST,
     NORTH,
     WEST,
 }
 
 const DirectionToCardinal: {[k in Direction] : string } = {
     [Direction.SOUTH]: 'SOUTH',
     [Direction.NORTH]: 'NORTH',
     [Direction.EAST]: 'EAST',
     [Direction.WEST]: 'WEST',
 }
 
 interface State {
     breakerMode: boolean;
     inverted: boolean;
     l: number;
     c: number;
     process: boolean;
     direction: Direction;
     path: Direction[],
     loopId: number,
 }
 
 type MoveFn = (state: State) => State;
 
 const goSouth: MoveFn = (state) => ({
     ...state,
     l: state.l + 1,
     direction: Direction.SOUTH,
     path: [...state.path, Direction.SOUTH],
 });
 
 const goEast: MoveFn = (state) => ({
     ...state,
     c: state.c + 1,
     direction: Direction.EAST,
     path: [...state.path, Direction.EAST],
 
 });
 
 const goNorth: MoveFn = (state) => ({
     ...state,
     l: state.l - 1,
     direction: Direction.NORTH,
     path: [...state.path, Direction.NORTH],
 
 });
 
 
 const goWest: MoveFn = (state) => ({
     ...state,
     c: state.c - 1,
     direction: Direction.WEST,
     path: [...state.path, Direction.WEST]
 
 });
 
 const PRIORITY: MoveFn[] = [goSouth, goEast, goNorth, goWest];
 
 const canProceed = (input: Space[][], state: State) => {
     if (state.l >= L || state.c >= C || state.l < 0 || state.c < 0) return false;
     const step = input[state.l][state.c];
     if (step.type === Place.OBSTACLE) return false;
     if (step.type === Place.BREAKABLE) {
         if  (!step.isBroken && !state.breakerMode){
         return false;
         }
         step.isBroken = true;
         state.loopId += 1;
     }
     if (step.visited[state.direction] === state.loopId) throw new Error('LOOP');
     step.visited[state.direction] = state.loopId;
     return true;
 }
 
 const move = (graph: Space[][], state: State) => {
     // try the same direction:
     let nextState = PRIORITY[state.direction](state);
     if (canProceed(graph, nextState)) {
         return nextState;
     }
     for (let i = 0; i < PRIORITY.length; i++) {
         const priorityKey = state.inverted ? PRIORITY.length - 1 - i : i;
         const nextState = PRIORITY[priorityKey](state);
         if (canProceed(graph, nextState)) {
             return nextState;
         }
     }
     throw new Error('Cannot make next move');
 }
 
 const applyModifiers = (state: State, curr: Space): State => {
     switch (curr.type) {
         case Place.SOUTH:
             return {
                 ...state,
                 direction: Direction.SOUTH,
             };
         case Place.EAST:
             return {
                 ...state,
                 direction: Direction.EAST,
             };
         case Place.NORTH:
             return {
                 ...state,
                 direction: Direction.NORTH,
             };
         case Place.WEST:
             return {
                 ...state,
                 direction: Direction.WEST,
             };
         case Place.INVERT:
             return {
                 ...state,
                 inverted: !state.inverted,
             };
         case Place.BEER:
             return {
                 ...state,
                 breakerMode: !state.breakerMode,
             };
         case Place.TELEPORT:
             return {
                 ...state,
                 l: curr.teleport?.[0] ?? state.l,
                 c: curr.teleport?.[1] ?? state.c,
             }
         case Place.BREAKABLE:
             return {
                 ...state,
             }
         default:
             return {...state}
     }
 }
 
 interface Space {
     type: Place,
     isBroken: boolean;
     visited: [number, number, number, number]
     teleport?: [number, number]
     
 }
 
 const genMap = (input: string[][]): {graph: Space[][], start:[number,number]} => {
     const graph: Space[][] = []
     let teleport: Space | undefined;
     let start: [number, number] | undefined;
     for (let i = 0; i < input.length; i++) {
         const row: Space[] = []
         for (let j = 0; j < input[i].length; j++) {
             const node: Space = {
                 type: input[i][j] as Place,
                 isBroken: false,
                 visited: [-1, -1, -1, -1],
             }
             if (node.type === Place.TELEPORT) {
                 if (teleport) {
                     node.teleport = teleport.teleport;
                     teleport.teleport = [i,j];
                     teleport = undefined;
                 } else {
                     node.teleport = [i,j]
                     teleport = node;
                 }
             }
             row.push(node);
             if (node.type === Place.START) {
                 start = [i,j]
             }
         }
         graph.push(row);
     }
     if (!start) throw new Error('Start not found');
     return {graph, start};
 }
 
 const stopBlunder = (input: string[][]): void => {
 
     let { graph, start } = genMap(input);
 
     let state: State = {
         breakerMode: false,
         inverted: false,
         l: start[0],
         c: start[1],
         process: true,
         direction: Direction.SOUTH,
         path: [],
         loopId: 0,
     }
     while (graph[state.l][state.c].type !== Place.SUICIDE) {
         const curr = graph[state.l][state.c];
         const modifiedState = applyModifiers(state, curr);
         try {
             state = move(graph, modifiedState);
         } catch {
             console.log('LOOP');
             return;
         }
     }
     state.path.map(p => console.log(DirectionToCardinal[p]));
 }