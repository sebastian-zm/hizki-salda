import { StadiumInGrid } from './stadium-in-grid.js';
import { Vector2d, Vector2dCssUnit } from './vector2d.js';
import { convertCssUnit as cu } from './convertCssUnit.js';
import { Segment2d } from './segment2d.js';
const oldStgs = [];
const stgParameter = {
    start: new Vector2dCssUnit(10, 10, 'vmin', 'vmin'),
    blankSpace: { length: 8, unit: 'vmin' },
    quantity: new Vector2d(10, 10)
};
const answer = (function (arr) {
    const ret = [];
    for (const seg of arr) {
        ret.push(new Segment2d({
            start: new Vector2d(seg[0], seg[1]),
            end: new Vector2d(seg[2], seg[3])
        }));
    }
    return ret;
})([[3, 0, 9, 0], [1, 1, 5, 1], [0, 3, 8, 3], [3, 4, 8, 4], [0, 5, 5, 5], [3, 8, 8, 8]]);
const answered = new Set();
let stg = new StadiumInGrid(stgParameter);
const mousePosition = new Segment2d({ start: new Vector2d(0, 0), end: new Vector2d(0, 0) });
let mouseIsDown = false;
stg.span.style.display = 'none';
document.body.appendChild(stg.span);
window.addEventListener('resize', function () {
    for (const oldStg of oldStgs) {
        oldStg.updateSegment();
        oldStg.span.style.borderColor = 'darkGreen';
    }
    stg.updateSegment();
    stg.span.style.display = 'none';
});
document.addEventListener('mousemove', function (evt) {
    const horizontal = window.innerWidth > window.innerHeight;
    if (mouseIsDown) {
        mousePosition.end = new Vector2d(evt.clientX - (horizontal ? (window.innerWidth - window.innerHeight) / 2 : 0), evt.clientY - (horizontal ? 0 : (window.innerHeight - window.innerWidth) / 2));
        convert(mousePosition.end, stg);
        stg.segment = mousePosition;
    }
});
document.addEventListener('mousedown', function (evt) {
    // If it might be unintentional, return.
    if (evt.metaKey || evt.ctrlKey || evt.altKey || evt.shiftKey || (evt.buttons & 1) !== 1) {
        return;
    }
    const horizontal = window.innerWidth > window.innerHeight;
    mousePosition.start = new Vector2d(evt.clientX - (horizontal ? (window.innerWidth - window.innerHeight) / 2 : 0), evt.clientY - (horizontal ? 0 : (window.innerHeight - window.innerWidth) / 2));
    for (const axis of Vector2d.axes) {
        mousePosition.start[axis] = Math.max(mousePosition.start[axis], cu(stg.grid.start[axis] + stg.grid.start.units[axis], null));
        mousePosition.start[axis] = Math.min(mousePosition.start[axis], cu(stg.grid.start[axis] + stg.grid.start.units[axis], null)
            + cu(stg.grid.blankSpace.length * stg.grid.quantity[axis]
                + stg.grid.blankSpace.unit, null));
    }
    convert(mousePosition.start, stg);
    mousePosition.end = mousePosition.start.copy();
    stg.segment = mousePosition;
    mouseIsDown = true;
    stg.span.style.display = '';
});
document.addEventListener('mouseup', function (evt) {
    if ((evt.buttons & 1) === 1) {
        return;
    }
    stg.segment = mousePosition;
    let found = false;
    for (const [index, seg] of answer.entries()) {
        if (!answered.has(index)) {
            let reversed = false;
            if (stg.segment.equals(seg.reversed)) {
                // Correct answer
                reversed = true;
                stg.segment = stg.segment.reversed;
            }
            if (reversed || seg.equals(stg.segment)) {
                // Correct answer
                found = true;
                answered.add(index);
                stg.span.style.borderColor = 'darkGreen';
                oldStgs.push(stg);
                stg = new StadiumInGrid(stgParameter);
                if (answered.size === answer.length) {
                    alert('Congrats!');
                }
                else {
                    document.body.appendChild(stg.span);
                }
                break;
            }
        }
    }
    stg.span.style.display = 'none';
    mouseIsDown = false;
});
function convert(rawEnd, stg) {
    for (const axis of Vector2d.axes) {
        rawEnd[axis] -= cu(stg.grid.start[axis] + stg.grid.start.units[axis], null);
        rawEnd[axis] /= cu(stg.grid.blankSpace.length + stg.grid.blankSpace.unit, null);
        rawEnd[axis] = Math.round(rawEnd[axis]);
    }
    return rawEnd;
}
