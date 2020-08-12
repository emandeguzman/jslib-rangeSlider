/**
 * requires uuidv4
 */


function rangeSlider (el, $options){
    //#region settings/options
    const props = {
        ...{
            min_val: 0,
            max_val: 100,

            val_min: 0,
            val_max: 100,
            pos_min: 0,
            pos_max: null,
            // cur_min: 0,
            // cur_max: 0,
            // leftmost: 0,
            // rightmost: null,
            onMinValueChanged: ()=>{},
            onMaxValueChanged: ()=>{}
        },
        ...$options
    }
    //#endregion

    //#region methods
    function valToPos(val) {
        const p = (val-props.val_min)/(props.val_max-props.val_min);
        return (props.pos_max - props.pos_min) * p + props.pos_min;
    }

    function posToVal(pos) {
        const p = (pos-props.pos_min)/(props.pos_max-props.pos_min);
        return (props.val_max - props.val_min) * p + props.val_min;
    }
    //#endregion

    //#region  build ui
    el.innerHTML = `<div class="range_slider">
                        <div class="outer_range"></div>
                        <div class="inner_range"></div>
                        <div class="handle_min"></div>
                        <div class="handle_max"></div>
                    </div>`
    const root = el.querySelector(".range_slider");
    const handle_min = root.querySelector(".handle_min");
    const handle_max = root.querySelector(".handle_max");
    const outer_range = root.querySelector(".outer_range");
    const inner_range = root.querySelector(".inner_range");
    //#endregion

    //#region  set position min & max val
    // const range_slider_bounds = root.getBoundingClientRect();
    const handle_width = handle_min.scrollWidth;
    // props.pos_min = 0;
    // props.pos_max = range_slider_bounds.width - handle_width;
    props.pos_min = 0;
    props.pos_max = root.scrollWidth - handle_width;
    //#endregion

    //#region  normalize value and pos
    props.val_min = Math.min(props.min_val, props.val_min);
    props.val_max = Math.max(props.max_val, props.val_max);
    //#endregion

    //#region position handle
    function positionUiElements() {
        handle_min.style.left = valToPos(props.min_val) + "px";
        handle_max.style.left = valToPos(props.max_val) + "px";
        inner_range.style.left = valToPos(props.min_val) + "px";
        inner_range.style.right = props.pos_max - valToPos(props.max_val) + "px";
    }
    positionUiElements();
    //#endregion

    //#region dragging
    function dragElement(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        // if (document.getElementById(elmnt.id + "header")) {
        //     // if present, the header is where you move the DIV from:
        //     document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        // } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        // }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            console.debug(pos3, props.pos_min);
            // pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            console.debug(e.clientX)
            pos1 = pos3 - e.clientX;
            // pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            // pos4 = e.clientY;
            // set the element's new position:
            // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";

            // set leftmost, rightmost limit
            let pos_min, pos_max;
            if (elmnt == handle_min) {
                pos_min = props.pos_min;
                pos_max = valToPos(props.max_val);
            }
            else if (elmnt == handle_max) {
                pos_min = valToPos(props.min_val);
                pos_max = props.pos_max;
            }

            // make sure value don't exceed min and max pos value
            let pos;
            if (elmnt.offsetLeft - pos1 < pos_min) {
                pos = pos_min;
            }
            else if (elmnt.offsetLeft - pos1 > pos_max) {
                pos = pos_max;
            }
            else {
                pos = elmnt.offsetLeft - pos1;
            }


            elmnt.style.left = pos + "px";
            

            // compute and set current valu
            // const p = (pos-props.pos_min)/(props.pos_max-props.pos_min);
            // const new_val = (props.max_val - props.min_val) * p + props.min_val;
            const new_val = posToVal(pos);
            
            if (elmnt == handle_min) {
                props.min_val = new_val;
                positionUiElements();
                props.onMinValueChanged(new_val);
            }
            else if (elmnt == handle_max) {
                props.max_val = new_val;
                positionUiElements();
                props.onMaxValueChanged(new_val);
            }
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    dragElement(handle_min);
    dragElement(handle_max);
    //#endregion
}
