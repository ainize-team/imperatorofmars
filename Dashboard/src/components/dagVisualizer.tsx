/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { useSearchParams } from 'next/navigation';
import NodeDatum from '@/types/nodeDatum';
import LinkDatum from '@/types/linkDatum';

type props = {
  nodes: any[]
  handleNodes: Function,
  links: any[],
  handleLinks: Function,
  selectedNodes: any[],
  handleSelectedNodes: Function,
}

export default function DagVisualizer({ nodes, handleNodes, links, handleLinks, selectedNodes, handleSelectedNodes }: props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [fetchingCid, setFetchingCid] = useState<string>('');
  const [isConnected, setIsConnected] = useState(true); // Set initial state to true

  const searchParams = useSearchParams();

  // Initialize API connection
  useEffect(() => {
    const cid = searchParams.get("cid");
    console.log('cid :>> ', cid);
    if (cid) {
      setFetchingCid(cid);
      fetchNodeByCid(cid);
    }
  }, [searchParams]);

  // Fetch node by CID
  const fetchNodeByCid = async (cid: string) => {
    if (!isConnected) {
      setError('Client is not connected. Click the Connect button first.');
      return;
    }
    
    if (!cid.trim()) {
      setError('Please enter a CID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Check if the node already exists
      if (!nodes.some((n: any) => n.cid === cid)) {
        const queue = [ {parent: null, cid} ];
        const visitedCids = new Set();

        while (queue.length > 0) {
          const edge = queue.shift();
          visitedCids.add(edge!.cid);
          try {
            const nodeResponse = await fetch(`/api/dag/get?cid=${edge!.cid}`);
            const nodeResult = await nodeResponse.json();
            console.log('nodeResult :>> ', nodeResult);
            if (nodeResult && !nodes.some((n: any) => n.cid === nodeResult.cid)) {
              const node = {
                id: nodeResult.cid,
                cid: nodeResult.cid,
                message: nodeResult.message || `Child of ${nodeResult.cid.substring(0, 6)}`,
                type: 'message',
                children: nodeResult.children || [],
                data: nodeResult.data
              };
              
              handleNodes(node);
              if (edge!.parent) {
                handleLinks({source: edge!.parent, target: node.id})
              }
              // Add child nodes to the queue
              node.children.map((childCid: string) => {
                if (!visitedCids.has(childCid) && !nodes.some((n: any) => n.cid === childCid)) {
                  queue.push({parent: node.id, cid: childCid})
                }
              });
            }
          } catch (childErr) {
            console.error(`Failed to fetch child node ${edge!.cid}:`, childErr);
          }
        }
      }
      setLoading(false);
      setFetchingCid('');
    } catch (err: any) {
      setError(`Failed to fetch node: ${err.message}`);
      setLoading(false);
    }
  };

  // Initialize D3 visualization
  useEffect(() => {
    if (nodes.length === 0 || typeof window === 'undefined') return;

    // D3 visualization setup
    const width = 600;
    const height = 1200;
    
    // Remove previous SVG
    d3.select("#dag-container svg").remove();
    
    const svg = d3.select<SVGSVGElement, unknown>("#dag-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
    
    // Prepare data
    const nodeData = nodes.map((node: any) => ({ ...node }));
    const linkData = links.map((link: any) => ({ ...link }));
    
    const simulation = d3.forceSimulation<NodeDatum>(nodeData)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(linkData).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX().strength(0.1).x(d => Math.max(0, Math.min(800, d.x!))))
      .force("y", d3.forceY().strength(0.1).y(d => Math.max(0, Math.min(600, d.y!))));
    
    // Define arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");
    
    // Draw links
    const link = svg.append("g")
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");
    
    // Create node group
    const node = svg.append("g")
      .selectAll<SVGGElement, NodeDatum>(".node")
      .data<NodeDatum>(nodeData)
      .join<SVGGElement>("g")
      .attr("class", "node")
      .call(
        d3.drag<SVGGElement, NodeDatum, NodeDatum>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
      .on("click", (event, d) => {
        // Toggle node selection
        handleSelectedNodes(d);
        event.stopPropagation();
      });
    
    // Draw node circles
    node.append("circle")
      .attr("r", 20)
      .attr("fill", (d: any) => d.type === 'message' ? "#66ccff" : "#ff9966")
      .attr("stroke", (d: any) => selectedNodes.some((node: any) => node.id === d.id) ? "#ff0000" : "#fff")
      .attr("stroke-width", (d: any) => selectedNodes.some((node: any) => node.id === d.id) ? 2 : 1);
    
    // Node labels
    node.append("text")
      .attr("dx", 25)
      .attr("dy", 4)
      .text((d: any) => {
        const text = d.message || d.cid;
        return text.length > 20 ? text.substring(0, 17) + '...' : text;
      });
    
    // Simulation tick event handler
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      node.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });
    
    // Drag event handlers
    function dragstarted(event: d3.D3DragEvent<SVGGElement, NodeDatum, NodeDatum>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGGElement, NodeDatum, NodeDatum>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGGElement, NodeDatum, NodeDatum>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Clear selected nodes on canvas click
    svg.on("click", () => {
      handleSelectedNodes([]);
    });
    
    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNodes]);

  return (
    <div className="flex-1 border-2 border-black h-[80vh] overflow-hidden">
      <div>Dag Visualizer</div>
      <div id="dag-container">
        {loading && (
          <div>
            <div>Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}