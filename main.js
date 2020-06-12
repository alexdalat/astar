

let debug = true;
let tile_count = 10;

let canvas;
let path_found = false;
let playing = false;
let tile_size_x;
let tile_size_y;

const START = new Tile(new vec2(8, 8))
const END = new Tile(new vec2(2, 2))
let OPEN = []
let CLOSED = []
let FINAL_PATH = []

OPEN.push(START)


let bounds = {
	min_x: 0,
	min_y: 0,
	max_x: 10,
	max_y: 10,
}

let slider1;
let slider1_label_text = "G Scalar"
function setup() {
	canvas = createCanvas(640, 640)
	//canvas.mouseDragged(mousePressedEvent);
	disableRightClickContextMenu(canvas.canvas);
	

	tile_size_x = canvas.width / tile_count
	tile_size_y = canvas.height / tile_count

	/* Input */
	button = createButton('clear');
	button.size(60, 25)
	button.position(canvas.canvas.offsetLeft-40, canvas.canvas.offsetTop);
	button.mousePressed(clear_grid);

	play_pause_button = createButton('pause');
	play_pause_button.size(60, 25)
	play_pause_button.position(canvas.canvas.offsetLeft-40, canvas.canvas.offsetTop+40);
	play_pause_button.mousePressed(pause);

	button = createButton('reset');
	button.size(60, 25)
	button.position(canvas.canvas.offsetLeft-40, canvas.canvas.offsetTop+80);
	button.mousePressed(reset);
}

function draw() {
	clear()
	background(255)

	if(!path_found && !playing) {
		let [current, current_idx] = Tile.getLowestF(OPEN);
		let closed_idx = vec2.getArrIndex(CLOSED, current.xy)
		if (current_idx > -1) {
			OPEN.splice(current_idx, 1);
		} else console.log("OPEN empty")
		if(closed_idx === -1) {
			CLOSED.push(current)
		}

		if(current.xy.equal(END.xy)) {
			let curr = current;
			let depth = 0;
			while(curr !== undefined && depth < 50) {
				FINAL_PATH.push(curr);
				curr = curr.parent;
				depth++;
			}
			path_found = true;
		}

		let neighbor_arr = current.getNeighbours(bounds)
		for(let n = 0; n < neighbor_arr.length; n++) {
			let neighbor = neighbor_arr[n];
			let n_idx = vec2.getArrIndex(OPEN, neighbor.xy);

			if(vec2.getArrIndex(CLOSED, neighbor.xy) !== -1) continue;

			let new_g = current.g_cost + current.xy.distance(neighbor.xy)
			if(n_idx !== -1) { // pre-existing
				if(new_g < OPEN[n_idx].g_cost) { // better path!
					OPEN[n_idx].g_cost = new_g
					OPEN[n_idx].h_cost = neighbor.xy.distance(END.xy)
					OPEN[n_idx].f_cost = neighbor.g_cost + neighbor.h_cost
					OPEN[n_idx].parent = current
				}
			} else { // new
				neighbor.g_cost = new_g
				neighbor.h_cost = neighbor.xy.distance(END.xy)
				neighbor.f_cost = neighbor.g_cost + neighbor.h_cost
				neighbor.parent = current
				if(vec2.getArrIndex(OPEN, neighbor.xy) === -1) OPEN.push(neighbor)
			}
		}
	}

	drawGridContent();
	drawGrid();
}
function mouseDragged() {
	let idx = vec2.getArrIndex(OPEN, new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y)));
	if(mouseButton === "left") {
		if(idx !== -1 && !OPEN[idx].wall) {
			OPEN[idx] = new Tile(new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y)), undefined, Infinity, true);
		} else 
			OPEN.push(new Tile(new vec2(int(mouseX / tile_size_x, 0), int(mouseY / tile_size_y)), undefined, Infinity, true))
	} else if(mouseButton === "right") {
		if(idx !== -1 && OPEN[idx].wall) {
			OPEN.splice(idx, 1)
		}
	}

}
function play() {
	playing = false
	play_pause_button.mousePressed(pause);
	play_pause_button.elt.innerHTML = "pause"
}
function pause() {
	playing = true
	play_pause_button.mousePressed(play);
	play_pause_button.elt.innerHTML = "play"
}
function clear_grid() {
	path_found = false
	OPEN = OPEN.filter(i => i.wall === true)
	OPEN.push(START);
	CLOSED = []
	FINAL_PATH = []
}
function reset() {
	path_found = false
	OPEN = []
	OPEN.push(START);
	CLOSED = []
	FINAL_PATH = []
}
function drawGridContent() {
	strokeWeight(0)

	// open
	drawGridContentArr(OPEN.filter(i => i.wall !== true), true);
	drawGridContentArrText(OPEN);

	// closed
	fill(255, 0, 0)
	drawGridContentArr(CLOSED);
	drawGridContentArrText(CLOSED);

	// final_path
	fill(0, 255, 255)
	drawGridContentArr(FINAL_PATH);
	//drawGridContentArrText(FINAL_PATH);

	// start
	fill(245, 212, 0)
	drawTile(START.xy)

	// finish
	fill(96, 50, 168)
	drawTile(END.xy)

	// walls
	drawGridContentArr(OPEN.filter(i => i.wall === true), true);
	drawGridContentArrText(OPEN);

}
function drawGridContentArr(arr, open_custom) {
	for(let i = 0; i < arr.length; i++) {
		if(open_custom) {
			if(arr[i].wall)fill(125, 125, 125)
			else fill(0, 255, 0)
		}
		drawTile(arr[i].xy)
	}
}
function drawGridContentArrText(arr) {
	for(let i = 0; i < arr.length; i++) {
		if(debug && !arr[i].wall) {
			drawText(round(arr[i].f_cost, 1), color(100, 100, 100), arr[i].xy.x * tile_size_x + tile_size_x/2, arr[i].xy.y*tile_size_y + tile_size_y, 12)
		}
	}
}
function drawTile(vec2) {
	rect(vec2.x*tile_size_x, vec2.y*tile_size_y, tile_size_x, tile_size_y)
}
function drawGrid() {
	stroke(0);	
	strokeWeight(1);

	for (let x = tile_size_x; x < width; x += tile_size_x) {
		line(x, 0, x, height);
	}
	for (let y = tile_size_y; y < height; y += tile_size_y) {
		line(0, y, width, y);
	}
}
function drawText(txt, color, left, top, size) {
	fill(color);
	strokeWeight(0);
	textStyle(BOLD);
	if(size === undefined) size = 20
	textSize(size);
	textFont('Arial');
	text(txt, left - textWidth(txt)/2, top-size/2);
}