import {LightningElement} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {loadScript} from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/D3';
import getAccounts from '@salesforce/apex/D3PlaygroundController.getAccounts';

export default class HorizontalLine extends LightningElement {

    d3Initialized = false;

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;
        loadScript(this, D3 + '/dist/d3.min.js')
            .then(() => {
                return getAccounts();
            })
            .then((response) => {
                this.renderHorizontalLollipopChart(response);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading D3',
                        message: error.message,
                        constiant: 'error'
                    })
                );
            });
    }

    renderHorizontalLollipopChart(data) {
        // set the dimensions and margins of the graph
        const margin = {top: 10, right: 30, bottom:70, left: 200},
            width = 760 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select(this.template.querySelector('.horizontal-lollipop-chart'))
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        // Parse the Data
        // Add X axis
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.AnnualRevenue))
            .range([0, width])
            .interpolate(d3.interpolateRound);
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

        // Y axis
        const y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.Name))
            .padding(1);
        svg.append('g')
            .call(d3.axisLeft(y));


        // Lines
        svg.selectAll('myline')
            .data(data)
            .enter()
            .append('line')
            .attr('x1', d => x(d.AnnualRevenue))
            .attr('x2', x(0))
            .attr('y1', d => y(d.Name))
            .attr('y2', d => y(d.Name))
            .attr('stroke', 'grey');

        // Circles
        svg.selectAll('mycircle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.AnnualRevenue))
            .attr('cy', d => y(d.Name))
            .attr('r', '4')
            .style('fill', '#69b3a2')
            .attr('stroke', 'blue');
    }
}