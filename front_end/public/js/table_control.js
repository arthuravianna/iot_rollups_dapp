// class TableControl {
//     constructor(table_id, pagination_id, filter_options, notices_table) {
//         this.table_id = table_id
//         this.pagination_id = pagination_id
//         this.notices_table = JSON.parse(notices_table)
//         this.url = "/?" // next epoch URL

//         filter_options = JSON.parse(filter_options)
//         if (filter_options.filterBusLine) {
//             this.url += `filterBusLine=${filter_options.filterBusLine}`
//         }
//         if (filter_options.fineTypeSelector) {
//             if (this.url.length != 2) {
//                 this.url += '&'
//             }
//             this.url += `fineTypeSelector=${filter_options.fineTypeSelector}`
//         }
//         if (this.url.length != 2) {
//             this.url += '&'
//         }
//         this.url += "epoch="

//         //console.log("URL", this.url)

//         this.curr_page = 1
//         this.build_table()
//     }

//     build_table() {
//         let table_elem = document.getElementById(this.table_id+"Body")
//         let pagination_elem = document.getElementById(this.pagination_id)
//         if (this.notices_table) {
//             // building table body
//             let table_html = ''
//             for (let i = 0; i < this.notices_table[this.curr_page-1].length; i++) {
//                 let notice = this.notices_table[this.curr_page-1][i]
//                 //console.log(notice)
//                 let td_html = ''
//                 + `<tr class="clickable-row" id="${notice.epoch_index};${notice.input_index}" onclick="draw_notice(${JSON.stringify(notice)})">`
//                 + `<td>${notice.bus_line}</td>`
//                 + `<td>${notice.ts}</td>`
//                 + `<td>${notice.value}</td>`
//                 + `</tr>`

//                 table_html += td_html
//             }
//             table_elem.innerHTML = table_html
            
            
            
//             // building table pagination
//             let prev_disabled = "" // previous page button state
//             let next_disabled = "" // next page button state
//             let next_epoch
//             let prev_epoch
//             let pagination_html = ''
//             let prev_btn_html
//             let next_btn_html

//             // page check
//             if (this.curr_page == 1) {
//                 //prev_disabled = true
//                 prev_disabled = "disabled"
//             }
//             if (this.curr_page == this.notices_table.length) {
//                 next_disabled = "disabled"
//             }

//             // epoch check
//             if (this.req_epoch < this.current_epoch) {
//                 next_epoch = this.req_epoch + 1
//             }
//             if (this.req_epoch > 0) {
//                 prev_epoch = this.req_epoch - 1
//             }
            
//             // previous button
//             if (prev_epoch != undefined && this.curr_page == 1) {
//                 prev_btn_html = `<li class="page-item"><a class="page-link" href="${this.url}${prev_epoch}" title="Previous-Epoch" > "prev epoch" </a></li>`
//             }
//             else {
//                 prev_btn_html = `<li class="page-item ${prev_disabled}"><button class="page-link" onclick="page_change(${this.curr_page-1})" title="Previous-Page" > "prev" </button></li>`
//             }
//             pagination_html += prev_btn_html


//             if (this.notices_table.length <= 5) {
//                 for (var i = 1; i <= this.notices_table.length; i++) {
//                     if (i == this.curr_page) {
//                         pagination_html += `<li class="page-item disabled"><button class="page-link" title="Page-${i}" > ${i} </button></li>`
//                     }
//                     else {
//                         pagination_html += `<li class="page-item"><button class="page-link" onclick="finesTable.page_change(${i})" title="Page-${i}" > ${i} </button></li>`
//                     }   
//                 }                  
//             }
//             else {
//                 if (page - 3 > 1) {
//                     pagination_html += `<li class="page-item"><button class="page-link" onclick="${this.page_change(1)}" title="Page-${1}" > "${1}" </button></li>`
//                     pagination_html += `<li class="page-item"><button class="page-link" title="" > "..." </button></li>`
//                     pagination_html += `<li class="page-item"><button class="page-link" onclick="${this.page_change(this.curr_page-1)}" title="Page-${this.curr_page-1}" > "Page-${this.curr_page-1}" </button></li>`
//                 }
//                 else {
//                     for (let i = 1; i < this.curr_page; i++) {
//                         pagination_html += `<li class="page-item"><button class="page-link" title="Page-${i}" > "${i}" </button></li>`
//                     }
//                 }
                
//                 pagination_html += `<li class="page-item disabled"><button class="page-link" title="Page-${this.curr_page}" > "${this.curr_page}" </button></li>`
        
//                 if (page + 3 < notices_table.length) {
//                     pagination_html += `<li class="page-item"><button class="page-link" onclick="${this.page_change(this.curr_page+1)}" title="Page-${this.curr_page+1}" > "Page-${this.curr_page+1}" </button></li>`
//                     pagination_html += `<li class="page-item"><button class="page-link" title="" > "..." </button></li>`
//                     pagination_html += `<li class="page-item"><button class="page-link" onclick="${this.page_change(this.notices_table.length)}" title="Page-${this.notices_table.length}" > "${this.notices_table.length}" </button></li>`
//                 }
//                 else {
//                     for (let i = page+1; i <= notices_table.length; i++) {
//                         pagination_html += `<li class="page-item"><button class="page-link" title="Page-${i}" > "${i}" </button></li>`
//                     }
//                 }
//             }

//             // next button
//             if (next_epoch != undefined && page == notices_table.length) {
//                 next_btn_html = `<li class="page-item"><a class="page-link" href="${this.url}${next_epoch}" title="Next-Epoch" > "next epoch" </a></li>`
//             }
//             else {
//                 next_btn_html = `<li class="page-item ${next_disabled}"><button class="page-link" onclick="page_change(${this.curr_page+1})" title="Next-Page" > "next" </button></li>`
//             }
//             pagination_html += next_btn_html


//             pagination_elem.innerHTML = pagination_html
//         }
//         else {
//             table_elem.innerHTML = '<tr><td colspan="3" class="text-center">No data to show</td></tr>'
//             pagination_elem.innerHTML = ''
//         }
//     }

//     page_change(page) {
//         this.curr_page = page
//         this.build_table()
//     }
// }


function build_table(table_id, pagination_id) {
    let table_elem = document.getElementById(table_id+"Body")
    let pagination_elem = document.getElementById(pagination_id)
    console.log(table_id, pagination_id)

    if (notices_table) {
        // building table body
        let table_html = ''
        for (let i = 0; i < notices_table[curr_page-1].length; i++) {
            let notice = notices_table[curr_page-1][i]
            //console.log(notice)
            let td_html = ''
            + `<tr class="clickable-row" id="${notice.epoch_index};${notice.input_index}" onclick="draw_notice(${JSON.stringify(notice)})">`
            + `<td>${notice.bus_line}</td>`
            + `<td>${notice.ts}</td>`
            + `<td>${notice.value}</td>`
            + `</tr>`

            table_html += td_html
        }
        table_elem.innerHTML = table_html
        
        
        
        // building table pagination
        let prev_disabled = "" // previous page button state
        let next_disabled = "" // next page button state
        let next_epoch
        let prev_epoch
        let pagination_html = ''
        let prev_btn_html
        let next_btn_html

        // page check
        if (curr_page == 1) {
            //prev_disabled = true
            prev_disabled = "disabled"
        }
        if (curr_page == notices_table.length) {
            next_disabled = "disabled"
        }

        // epoch check
        if (req_epoch < curr_epoch) {
            next_epoch = req_epoch + 1
        }
        if (req_epoch > 0) {
            prev_epoch = req_epoch - 1
        }
        
        // previous button
        if (prev_epoch != undefined && curr_page == 1) {
            prev_btn_html = `<li class="page-item"><a class="page-link" href="${url}${prev_epoch}" title="Previous-Epoch" > prev epoch </a></li>`
        }
        else {
            prev_btn_html = `<li class="page-item ${prev_disabled}"><button class="page-link" onclick="page_change(${table_id},${pagination_id},${curr_page-1})" title="Previous-Page" > prev </button></li>`
        }
        pagination_html += prev_btn_html


        if (notices_table.length <= 5) {
            for (var i = 1; i <= notices_table.length; i++) {
                if (i == curr_page) {
                    pagination_html += `<li class="page-item disabled"><button class="page-link" title="Page-${i}" > ${i} </button></li>`
                }
                else {
                    pagination_html += `<li class="page-item"><button class="page-link" onclick="page_change("${table_id}","${pagination_id}",${i})" title="Page-${i}" > ${i} </button></li>`
                }   
            }                  
        }
        else {
            if (curr_page - 3 > 1) {
                pagination_html += `<li class="page-item"><button class="page-link" onclick="page_change(1)" title="Page-${1}" > "${1}" </button></li>`
                pagination_html += `<li class="page-item"><button class="page-link" title="" > "..." </button></li>`
                pagination_html += `<li class="page-item"><button class="page-link" onclick="page_change("${table_id}","${pagination_id}",${curr_page-1})" title="Page-${curr_page-1}" > Page-${curr_page-1} </button></li>`
            }
            else {
                for (let i = 1; i < curr_page; i++) {
                    pagination_html += `<li class="page-item"><button class="page-link" title="Page-${i}" > ${i} </button></li>`
                }
            }
            
            pagination_html += `<li class="page-item disabled"><button class="page-link" title="Page-${curr_page}" > ${curr_page} </button></li>`
    
            if (curr_page + 3 < notices_table.length) {
                pagination_html += `<li class="page-item"><button class="page-link" onclick="page_change("${table_id}","${pagination_id}",${curr_page+1})" title="Page-${curr_page+1}" > Page-${curr_page+1} </button></li>`
                pagination_html += `<li class="page-item"><button class="page-link" title="" > "..." </button></li>`
                pagination_html += `<li class="page-item"><button class="page-link" onclick="page_change("${table_id}","${pagination_id}",${notices_table.length})" title="Page-${notices_table.length}" > ${notices_table.length} </button></li>`
            }
            else {
                for (let i = page+1; i <= notices_table.length; i++) {
                    pagination_html += `<li class="page-item"><button class="page-link" title="Page-${i}" > ${i} </button></li>`
                }
            }
        }

        // next button
        if (next_epoch != undefined && page == notices_table.length) {
            next_btn_html = `<li class="page-item"><a class="page-link" href="${url}${next_epoch}" title="Next-Epoch" > next epoch </a></li>`
        }
        else {
            next_btn_html = `<li class="page-item ${next_disabled}"><button class="page-link" onclick="page_change("${table_id}","${pagination_id}",${curr_page+1})" title="Next-Page" > next </button></li>`
        }
        pagination_html += next_btn_html


        pagination_elem.innerHTML = pagination_html
    }
    else {
        table_elem.innerHTML = '<tr><td colspan="3" class="text-center">No data to show</td></tr>'
        pagination_elem.innerHTML = ''
    }
}

function page_change(table_id, pagination_id, page) {
    curr_page = page
    console.log(table_id, pagination_id, page)
    build_table(table_id, pagination_id)
}

let url = "/?" // next epoch URL

if (filter_options.filterBusLine) {
    url += `filterBusLine=${filter_options.filterBusLine}`
}
if (filter_options.fineTypeSelector) {
    if (url.length != 2) {
        url += '&'
    }
    url += `fineTypeSelector=${filter_options.fineTypeSelector}`
}
if (url.length != 2) {
    url += '&'
}

let curr_page = 1
