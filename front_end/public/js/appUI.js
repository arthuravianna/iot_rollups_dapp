const navbar_height = 58 + 16 + 1 // navbar + padding + border-bottom
const div_margin_top = 24 // map parent div margin top


class AppUI {
    constructor(map_id, table_id) {
        this.window_element = window;
        this.map_id = map_id
        this.table_id = table_id

        // set initial map height
        this.resize_elements()

        // this.window_element.addEventListener('resize', () => {
        //     this.resize_elements()
        // });
    }

    //-------------------------------------------
    //  Window Resize functions
    //-------------------------------------------
    resize_elements() {
        document.getElementById(this.map_id).style.height = `${this.window_element.innerHeight - navbar_height - div_margin_top}px`
    }

}