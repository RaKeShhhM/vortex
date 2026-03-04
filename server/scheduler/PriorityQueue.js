class PriorityQueue {
  constructor() { this._heap = []; }
  get size() { return this._heap.length; }
  isEmpty() { return this._heap.length === 0; }

  enqueue(job) {
    this._heap.push(job);
    this._bubbleUp(this._heap.length - 1);
    console.log(`[PriorityQueue] Added "${job.name}" priority ${job.priority}. Size: ${this.size}`);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const top = this._heap[0];
    const last = this._heap.pop();
    if (this._heap.length > 0) { this._heap[0] = last; this._sinkDown(0); }
    return top;
  }

  peek() { return this._heap[0] || null; }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this._heap[index].priority < this._heap[parent].priority) {
        [this._heap[index], this._heap[parent]] = [this._heap[parent], this._heap[index]];
        index = parent;
      } else break;
    }
  }

  _sinkDown(index) {
    const length = this._heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < length && this._heap[left].priority < this._heap[smallest].priority) smallest = left;
      if (right < length && this._heap[right].priority < this._heap[smallest].priority) smallest = right;
      if (smallest !== index) {
        [this._heap[index], this._heap[smallest]] = [this._heap[smallest], this._heap[index]];
        index = smallest;
      } else break;
    }
  }

  printQueue() {
    const sorted = [...this._heap].sort((a, b) => a.priority - b.priority);
    sorted.forEach((job, i) => console.log(`  ${i + 1}. [P:${job.priority}] ${job.name}`));
  }
}

module.exports = PriorityQueue;
