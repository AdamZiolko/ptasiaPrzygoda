import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import './dijkstraMap.css';

export function DijkstraMap() {
    const [addNodeMode, setAddNodeMode] = useState(false);

    const canvasRef = useRef(null);
    const [graph, setGraph] = useState({
      a: { b: 1, c: 4 },
      b: { a: 1, d: 2, e: 5 },
      c: { a: 4, d: 4 },
      d: { b: 2, c: 4, e: 1 },
      e: { b: 5, d: 1 }
    });
    const [selectedNodes, setSelectedNodes] = useState([]);
  
    const getNextNodeName = (currentHighestNodeName: string) => {
      const lastChar = currentHighestNodeName.slice(-1);
      if (lastChar < 'z') {
        return currentHighestNodeName.slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0) + 1);
      } else {
        return currentHighestNodeName + 'a';
      }
    };
  
    const addNode = () => {
      const highestNodeName = Object.keys(graph).sort().pop() || 'a';
      const nextNodeName = getNextNodeName(highestNodeName);
      setGraph(prevGraph => ({
        ...prevGraph,
        [nextNodeName]: {}
      }));
    };
  
    const addEdge = () => {
      if (selectedNodes.length === 2) {
        setGraph(prevGraph => ({
          ...prevGraph,
          [selectedNodes[0]]: { ...prevGraph[selectedNodes[0]], [selectedNodes[1]]: 1 },
          [selectedNodes[1]]: { ...prevGraph[selectedNodes[1]], [selectedNodes[0]]: 1 }
        }));
        setSelectedNodes([]);
      }
    };
  
    useEffect(() => {
      if (canvasRef.current) {
        paper.setup(canvasRef.current);
  
        const nodePositions = {};
        const nodeItems = {};
        const edgePaths = [];
        let redrawEdges;
  
        const drawGraph = () => {
          paper.project.clear();
  
          const centerX = paper.view.size.width / 2;
          const centerY = paper.view.size.height / 2;
          const radius = Math.min(centerX, centerY) * 0.8;
  
          const nodeCount = Object.keys(graph).length;
          Object.keys(graph).forEach((node, i) => {
            const angle = (i / nodeCount) * 2 * Math.PI;
            const position = new paper.Point(
              centerX + radius * Math.cos(angle),
              centerY + radius * Math.sin(angle)
            );
            nodePositions[node] = position;
  
            const circle = new paper.Path.Circle({
              center: position,
              radius: 30,
              fillColor: selectedNodes.includes(node) ? 'blue' : 'red'
            });
            circle.onMouseDrag = function(event) {
              this.position = this.position.add(event.delta);
              nodePositions[node] = this.position;
              redrawEdges();
            };
            
            circle.onClick = function() {
              setSelectedNodes(prevSelectedNodes => {
                if (prevSelectedNodes.includes(node)) {
                  return prevSelectedNodes.filter(n => n !== node);
                } else if (prevSelectedNodes.length === 2) {
                  return prevSelectedNodes;
                } else {
                  return [...prevSelectedNodes, node];
                }
              });
            };
            nodeItems[node] = circle;
          });
  
          redrawEdges = () => {
            edgePaths.forEach(path => path.remove());
            edgePaths.length = 0;
            Object.keys(graph).forEach(node => {
              Object.keys(graph[node]).forEach(neighbor => {
                const path = new paper.Path.Line({
                  from: nodePositions[node],
                  to: nodePositions[neighbor],
                  strokeColor: 'black'
                });
                edgePaths.push(path);
              });
            });
          };
          redrawEdges();
        };
  
        drawGraph();
  
        window.addEventListener('resize', drawGraph);
  
        return () => {
          window.removeEventListener('resize', drawGraph);
        };
      }
    }, [graph, selectedNodes]);
  
    return (
      <div className="canvas-container">
        <canvas ref={canvasRef} className="full-page-canvas" />
        <button onClick={addNode}>wezel</button>
        <button onClick={addEdge}>krawedz</button>
      </div>
    );
  }