import React, { Component } from 'react';
import * as d3 from 'd3'
import { select } from 'd3-selection'
import graph from '../static/graph.json'


const WIDTH = 1300;
const HEIGHT = 620;

class ForceLayout extends Component{

	componentDidMount() {
        this.createForceLayout();
    }

    componentDidUpdate() {
        this.createForceLayout();
    }

    createDrag(force) {
        let startTime = 0;
        var drag = d3.drag()
            .on('start', (d) => {
                startTime = (new Date()).getTime();
                d3.event.sourceEvent.stopPropagation();
                if (! d3.event.active) {
                    force.alphaTarget(0.3).restart();
                }
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', d => {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            })
            .on('end', d => {
                const nowTime = (new Date()).getTime();
                if (!d3.event.active) {
                    force.alphaTarget(0);
                }
                if (nowTime - startTime >= 150) {
                    d.fixed = true;
                    d.locked = true;
                }
            })
        return drag;
    }

    handleData() {

        const nodeData = graph.nodeData;
        const relationData = graph.relationData;

        let nodes = [];
        for (let i = 0; i < nodeData.length; i++)
        {
            nodes.push({
                id: i,
                name: nodeData[i].title,
                tag: nodeData[i].tag
            })
        }

        let edges = [];
        for (var i = 0; i < relationData.length; i++) {
            let rData = relationData[i];
            edges.push({
                id: i,
                source: rData.source,
                target: rData.target,
                tag: "rel"+i
            })
        }

        return {
            nodes: nodes,
            edges: edges
        }
    }

    createForceLayout() {
        var dataDic = this.handleData();
        let nodes = dataDic["nodes"];
        let edges = dataDic["edges"];

        if (nodes.length === 0) {
            return;
        }

        var svg = select("svg")
        console.log(d3.forceManyBody());
        var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(120).strength(1))
        .force("charge", d3.forceManyBody().strength(-1200))
        .force("center", d3.forceCenter(WIDTH / 3, HEIGHT / 2));

        this.updateForceLayout(svg, simulation, edges, nodes);
    }

    updateForceLayout(svg, simulation, links, nodes) {

        svg.selectAll("textPath").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();
        svg.selectAll("g").remove();
        svg.selectAll("path").remove();

        let link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr('marker-end','url(#arrowhead)')
            .style('stroke', '#999')

        link.append("text")
            .style('fill', '#888')
            .style("pointer-events", "none")
            .text(function (d) {return 'd.type';});

        let drag = this.createDrag(simulation);

        var edgepaths = svg.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attr("class", "edgepath")
            .attr('fill-opacity','fill-opacity')
            .attr('stroke-opacity', 0)
            .attr('id',function(d, i) {
                return 'edgepath' + i
            })
            .style("pointer-events", "none");

        var edgelabels = svg.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function(d, i) {
                return 'edgelabel' + i
            })
            .attr('font-size', 10)
            .attr('fill', "#aaa")

        edgelabels.append('textPath')
            .attr('xlink:href', function(d, i) {
                return '#edgepath' + i
            })
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function(d) {

                return d.tag
            });


        var node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(drag);

        node.append("circle")
            .attr("r", 30)
            .style("fill", function (d) {
                if (d.tag === "source") {
                    return '#73C06B';
                }
                else {
                    return '#7FA1B4';
                }
            })

        let that = this;
        node.append("text")
            .attr("dy", 4.5)
            .attr("dx", function (d) {
                let size = that.textSize("", d.name)
                return (0-size.width/2);
            })
            .style('fill', '#fff')
            .style("pointer-events", "none")
            .text(function (d) {
                return d.name;
            });

        simulation
            .nodes(nodes)
            .on("tick",  function() {
                link
                    .attr("x1", function (d) {return d.source.x;})
                    .attr("y1", function (d) {return d.source.y;})
                    .attr("x2", function (d) {return d.target.x;})
                    .attr("y2", function (d) {return d.target.y;});

                node
                    .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";
                });

                edgepaths.attr('d', function (d) {
                    return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                });

                edgelabels.attr('transform', function (d) {
                    if (d.target.x < d.source.x) {
                        var bbox = this.getBBox();

                        let rx = bbox.x + bbox.width / 2;
                        let ry = bbox.y + bbox.height / 2;
                        return 'rotate(180 ' + rx + ' ' + ry + ')';
                    }
                    else {
                        return 'rotate(0)';
                    }
                });
            });


        simulation.force("link")
            .links(links);
    }

    textSize(fontSize, text) {
        var span = document.createElement("span");
        var result = {};
        result.width = span.offsetWidth;
        result.height = span.offsetWidth;
        span.style.visibility = "hidden";
        document.body.appendChild(span);
        if (typeof span.textContent !== "undefined")
            span.textContent = text;
        else span.innerText = text;
        result.width = span.offsetWidth - result.width;
        result.height = span.offsetHeight - result.height;
        span.parentNode.removeChild(span);
        return result;
    }


     render() {
         return (
             <svg ref={chart => this.chart = chart}
                 width={'100%'} height={640} pointerEvents="all">
             </svg>
         )
     }
 }

 export default ForceLayout;
