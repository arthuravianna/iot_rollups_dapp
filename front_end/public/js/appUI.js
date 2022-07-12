const navbar_height = 58 + 16 + 1 // navbar + padding + border-bottom
const div_margin_top = 24 // map parent div margin top


class AppUI {
    constructor(map_id, table_id, histogram) {
        // UI elements
        this.map_id = map_id
        this.table_id = table_id
        this.histogram_conf = histogram

        // set initial map height
        this.prepare_elements()

        // window.addEventListener('resize', () => {
        //     this.prepare_elements()
        // });

        // make histogram minizable
        this.chart_btn_on_click(this.histogram_conf)

        // make element draggable
        this.dragElement(document.getElementById(this.histogram_conf.div_id))
    }

    //-------------------------------------------
    //  Window Resize functions
    //-------------------------------------------
    prepare_elements() {
        document.getElementById(this.map_id).style.height = `${window.innerHeight - navbar_height - div_margin_top}px`

        let histogram_elem = document.getElementById(this.histogram_conf.div_id)
        histogram_elem.style.top = navbar_height + "px"
        histogram_elem.style.left = 0
    }

    //-------------------------------------------
    //  Minimize event
    //-------------------------------------------
    chart_btn_on_click(chart) {
        let div = document.getElementById(chart.div_id)

        $("#"+chart.btn_minimize_id).click(() => {
            div.classList.add('visually-hidden');
        })

        $("#"+chart.btn_id).click(() => {
            div.classList.toggle('visually-hidden');
        })
    }


    //-------------------------------------------
    //  Element Draggable function
    //-------------------------------------------
    dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        console.log(elmnt.id + "Header")
        if (document.getElementById(elmnt.id + "Header")) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // verify if the div is inside screen
            let new_top = elmnt.offsetTop - pos2
            let new_left = elmnt.offsetLeft - pos1
            if (new_left + elmnt.offsetWidth >= window.innerWidth || new_left <= 0) {
                return
            }

            if (new_top + elmnt.offsetHeight >= window.innerHeight || new_top <= navbar_height) {
                return
            }

            // set the element's new position:
            elmnt.style.top = new_top + "px";
            elmnt.style.left = new_left + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}