/**
 * requires uuidv4
 */


function rangeSlider (el, $options){
    //#region settings/options
    const props = {
        ...{
            values: [0, 100],
            val_min: 0,
            val_max: 100,
            pos_min: 0,
            pos_max: null,
            onValueChanged: ()=>{}
        },
        ...$options
    }
    //#endregion

    //#region set value min & max limit (to make sure min_val is not less than val_min and same goes for max_val)
    props.val_min = Math.min(...props.values, props.val_min);
    props.val_max = Math.max(...props.values, props.val_max);
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
    el.innerHTML = "";

    const band = document.createElement("DIV");
    band.classList.add("band");

    const root = document.createElement("DIV");
    root.classList.add("range_slider");
    root.appendChild(band);
    el.appendChild(root)

    //add handles
    const handles = [];
    for (let i = 0; i < props.values.length; i++) {
        const handle = document.createElement("DIV");
        handle.classList.add("handle");
        handle.setAttribute("data-value", props.values[i]);
        handles.push(handle);
        root.appendChild(handle);
    }

    //#endregion

    //#region set size, position & limits
    function setUi() {
        //get container width
        //get root width
        const maxWidth = el.getBoundingClientRect().width;

        //set position min & max limit
        const handle_width =  handles[0].scrollWidth;
        props.pos_min = 0;
        props.pos_max = maxWidth - handle_width;

        //set handle positions based on value
        const positions = []; // to be used when setting to band size 
        for (let i = 0; i < props.values.length; i++) {
            const position = valToPos(handles[i].getAttribute("data-value"));
            positions.push(position);
            handles[i].style.left = `${position}px`;
        }

        //set band size and position
        band.style.left = Math.min(...positions) + "px";
        band.style.right = (props.pos_max - Math.max(...positions)) + "px";
    }

    setUi();
    //#endregion    

    //#region resize observer
    const resizeObserver = new ResizeObserver(entries => {
        console.log("resized")
        setUi();
    });

    resizeObserver.observe(el);
    //#region 

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
            // console.debug(pos3, props.pos_min);
            // pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            // console.debug(e.clientX)
            pos1 = pos3 - e.clientX;
            // pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            // pos4 = e.clientY;
            // set the element's new position:
            // elmnt.style.top = (elmnt.offsetTop - pos2) + "px";

            // set leftmost, rightmost limit
            let pos_min = props.pos_min, 
                pos_max = props.pos_max;
            
            // if (elmnt == handle_min) {
            //     pos_min = props.pos_min;
            //     pos_max = valToPos(props.max_val);
            // }
            // else if (elmnt == handle_max) {
            //     pos_min = valToPos(props.min_val);
            //     pos_max = props.pos_max;
            // }

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
            elmnt.setAttribute("data-value", posToVal(pos));

            //#region  throw onValueChange event
            const values = [];
            for (let i=0; i < handles.length; i++) {
                // values.push(posToVal(handles[i].style.left.replace("px","")));
                values.push(handles[i].getAttribute("data-value"));
                setUi();
            }
            props.onValueChanged(values);
            //#endregion

            // compute and set current valu
            // const p = (pos-props.pos_min)/(props.pos_max-props.pos_min);
            // const new_val = (props.max_val - props.min_val) * p + props.min_val;
            // const new_val = posToVal(pos);
            
            // if (elmnt == handle_min) {
            //     props.min_val = new_val;
            //     positionUiElements();
            //     props.onMinValueChanged(new_val);
            // }
            // else if (elmnt == handle_max) {
            //     props.max_val = new_val;
            //     positionUiElements();
            //     props.onMaxValueChanged(new_val);
            // }
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    handles.forEach(handle => dragElement(handle));
    //#endregion
}
