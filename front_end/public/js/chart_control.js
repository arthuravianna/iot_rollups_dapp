function get_random_color() {
    var makeColorCode = '0123456789ABCDEF';
    var code = '#';
    for (var count = 0; count < 6; count++) {
        code =code+ makeColorCode[Math.floor(Math.random() * 16)];
    }
    return code;
}


class ChartControl {
    constructor(chart_id, chart) {
        const ctx = document.getElementById(chart_id).getContext('2d');
        this.chart = new Chart(ctx, {
            type: chart.type,
            options: chart.options,
            datasets: []
        });
       
        // initial data
        this.query_data(chart.epoch, chart.select)
    }

    query_data(epoch, select) {
        let ajaxObj = query_chart_data(epoch, select)

        ajaxObj.done((response) => {
            if (!response.success) {
                console.log(`ERROR: ${response.result}`)
                return
            }
    
            let colors = []
            for (let i = 0; i < response.result.length; i++) {
                colors.push(get_random_color())
            }
            this.chart.data.datasets.push({
                backgroundColor: colors,
                data: response.result
            })
            this.chart.update()
        })

    }
}