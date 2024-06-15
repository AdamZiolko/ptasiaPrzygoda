import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import './dijkstraMap.css';
import { Button, createMuiTheme, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, makeStyles, TextField, ThemeProvider } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  floatingButton: {
    position: 'fixed',
    bottom: theme.spacing(2),
  },
  primaryButton: {
    right: theme.spacing(2),
  },
  secondaryButton: {
    color: 'black',
    right: theme.spacing(14),
  },
  thirdButton: {
    color: 'black',
    right: theme.spacing(45),
  },


  fpsDisplay: {
    top: theme.spacing(5),
    left: theme.spacing(5),
    color: 'white',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    position: 'absolute',
  },
}));


export function DijkstraMap() {
  const classes = useStyles();
  const [fps, setFps] = useState(0);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const canvasRef = useRef(null);
  const [switchState, setSwitchState] = useState(false);
  const [switchEdit, setSwitchEdit] = useState(false);
  const [editedNode, setEditedNode] = useState(null);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ nodeName: '', nodeConnections: '' });


  const changeSwitchState = () => {
    setSwitchState(prevSwitchState => {
      const newSwitchState = !prevSwitchState;
      console.log(newSwitchState, 'czy wlaczany');
      return newSwitchState;
    });
  };

  const changeSwitchEdit = () => {
    setSwitchEdit(prevSwitchEdit => {
      const newSwitchEdit = !prevSwitchEdit;
      console.log(newSwitchEdit, 'czy wlaczany edytcja');
      return newSwitchEdit;
    });
  };



  const [nodePositions, setNodePositions] = useState({});

  const [graph, setGraph] = useState({
    a: { b: 1, c: 4 },
    b: { a: 1, d: 2, e: 5 },
    c: { a: 4, d: 4 },
    d: { b: 2, c: 4, e: 1 },
    e: { b: 5, d: 1 }
  });
  let lastFrameTime = performance.now();

  const calculateFps = () => {
    const currentFrameTime = performance.now();
    const timeDifference = currentFrameTime - lastFrameTime;
    setFps(Math.round(1000 / timeDifference));
    lastFrameTime = currentFrameTime;
    requestAnimationFrame(calculateFps);
  };

  useEffect(() => {
    calculateFps();
  }, []);


  const handleResize = () => {
    setGraph({ ...graph });
  };



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
    setGraph(prevGraph => {
      // Create a deep copy of prevGraph
      const newGraph = JSON.parse(JSON.stringify(prevGraph));

      if (newGraph[selectedNodes[0]]?.[selectedNodes[1]]) {
        console.log('Before deletion:', newGraph);
        delete newGraph[selectedNodes[0]][selectedNodes[1]];
        delete newGraph[selectedNodes[1]][selectedNodes[0]];
        console.log('After deletion:', newGraph);
        return newGraph;
      } else {
        return {
          ...newGraph,
          [selectedNodes[0]]: { ...newGraph[selectedNodes[0]], [selectedNodes[1]]: 1 },
          [selectedNodes[1]]: { ...newGraph[selectedNodes[1]], [selectedNodes[0]]: 1 }
        };
      }
    });
    setSelectedNodes([]);
  }
};

  let circles: paper.Path.Circle[] = [];

  function changeAllCirclesColor(color) {
    circles.forEach(circle => {
      circle.fillColor = new paper.Color(color);
    });
  }
  ///////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (canvasRef.current) {
      paper.setup(canvasRef.current);
      paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);

      // const nodePositions = {};
      const nodeItems = {};
      const edgePaths: paper.Path.Line[] = [];
      let redrawEdges: () => void;

      const drawGraph = () => {
        paper.project.clear();

        const centerX = paper.view.size.width / 2;
        const centerY = paper.view.size.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;

        const nodeCount = Object.keys(graph).length;
        Object.keys(graph).forEach((node, i) => {
          const angle = (i / nodeCount) * 2 * Math.PI;
          const position = nodePositions[node] || new paper.Point(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          );
          nodePositions[node] = position;

          const circle = new paper.Path.Circle({
            center: position,
            radius: 30,
            fillColor: selectedNodes.includes(node) ? 'blue' : 'red'
          });
          circles.push(circle);

          let isDragging = false;



          if (!switchState) {
            circle.onMouseDown = function (event) {
              isDragging = false;
            };

            circle.onMouseDrag = function (event) {
              isDragging = true;
              const newPosition = this.position.add(event.delta);
              this.position = newPosition;
              setNodePositions(prevNodePositions => ({
                ...prevNodePositions,
                [node]: newPosition
              }));
              nodePositions[node] = newPosition; // Update the position in the local variable as well
              redrawEdges(node, newPosition);
            };

            circle.onMouseUp = function (event) {
              if (isDragging) {
                isDragging = false;
                return;
              }
            };

            circle.onClick = function () {
              console.log("jestem tutaj");
              console.log('switchEdit', switchEdit);
              // stan switch edit w use effekcje
              if (switchEdit) {
                setEditedNode(node);
                changeAllCirclesColor('red');
                this.fillColor = 'purple';
                console.log("jestem tutaj");
                console.log("Node name: ", node);
                console.log("Node connections: ", graph[node]);
                setDialogContent({ nodeName: node, nodeConnections: graph[node] });
                setOpen(true);
              }
            };


            console.log('switchState dragowanie', switchState);
          } else {
            circle.onMouseDown = function () { };
            circle.onMouseDrag = function () { };

            circle.onClick = function () {
              if (isDragging) {
                isDragging = false;
                return;
              }

              setSelectedNodes(prevSelectedNodes => {
                if (prevSelectedNodes.includes(node)) {
                  return prevSelectedNodes.filter(n => n !== node);
                } else if (prevSelectedNodes.length === 2) {
                  return prevSelectedNodes;
                } else {
                  const newSelectedNodes = [...prevSelectedNodes, node];
                  if (newSelectedNodes.length === 2) {
                    // Add an edge between the two selected nodes
                    addEdge();
                  }
                  return newSelectedNodes;
                }
              });
            };


          }
          nodeItems[node] = circle;
        });
        let edgePaths: (paper.Path.Line | paper.PointText)[] = [];

        redrawEdges = (movedNode, newPosition) => {
          edgePaths.forEach(path => path.remove());
          edgePaths.length = 0;
          let addedTexts = {}; // Object to keep track of added texts
          Object.keys(graph).forEach(node => {
            Object.keys(graph[node]).forEach(neighbor => {
              const path = new paper.Path.Line({
                from: node === movedNode ? newPosition : nodePositions[node],
                to: nodePositions[neighbor],
                strokeColor: 'grey'
              });
              edgePaths.push(path);

              // Create a unique identifier for the node pair
              let nodePair = [node, neighbor].sort().join('-');

              // Only add weight text if it hasn't been added for this pair
              if (!addedTexts[nodePair]) {
                const midPoint = path.getPointAt(path.length / 2);
                const weightText = new paper.PointText({
                  point: midPoint,
                  content: graph[node][neighbor],
                  fillColor: 'black',
                  justification: 'center',
                  fontSize: 18
                });
                edgePaths.push(weightText); // Add the weight text to the edgePaths array
                addedTexts[nodePair] = true; // Mark this pair as having a text
              }
            });
          });
        };
        redrawEdges();
      };

      drawGraph();
      ////////////////////////////////////////////////////////////////////////////////
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [graph, selectedNodes, switchState, switchEdit]);


  useEffect(() => {
    if (selectedNodes.length === 2) {
      addEdge();
    }
  }, [selectedNodes]);


  return (
    <ThemeProvider theme={theme}>
      <div className="canvas-container">
        <canvas ref={canvasRef} className="full-page-canvas" />
        <Button variant="contained" color="primary" onClick={addNode} className={`${classes.floatingButton} ${classes.primaryButton}`}>wezel</Button>


        <FormControlLabel
          control={
            <Switch
              aria-label='switch'
              checked={switchState}
              onChange={changeSwitchState}
              color="secondary"
              name="checkedB"
              inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
          }
          label="Tryb rysowania krawędzi"
          className={`${classes.floatingButton} ${classes.secondaryButton}`}
        />


        <FormControlLabel
          control={
            <Switch
              aria-label='switch'
              checked={switchEdit}
              onChange={changeSwitchEdit}
              color="secondary"
              name="checkedB"
              inputProps={{ 'aria-label': 'third checkbox' }}
            />
          }
          label="Tryb edycji węzłów"
          className={`${classes.floatingButton} ${classes.thirdButton}`}
        />


        <div className={` ${classes.fpsDisplay}`}>FPS: {fps}</div>

        <div>
          {/* ... */}
          <Dialog open={open} onClose={() => {
            const newGraph = { ...graph };
            newGraph[dialogContent.nodeName] = dialogContent.nodeConnections;
            setGraph(newGraph);
            setOpen(false);
          }}>
            <DialogTitle>{"Informacje o węźle"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <TextField
                  label="Nazwa węzła"
                  value={dialogContent.nodeName}
                  onChange={(e) => setDialogContent({ ...dialogContent, nodeName: e.target.value })}
                />
                {Object.entries(dialogContent.nodeConnections).map(([node, weight], index) => (
                  <div key={index}>
                    <TextField
                      label={`Węzeł ${node}`}
                      value={weight}
                      onChange={(e) => {
                        const newConnections = { ...dialogContent.nodeConnections };
                        newConnections[node] = Number(e.target.value);

                        const newGraph = { ...graph };
                        if (!newGraph[node]) {
                          newGraph[node] = {};
                        }
                        newGraph[node][dialogContent.nodeName] = Number(e.target.value);

                        setDialogContent({ ...dialogContent, nodeConnections: newConnections });
                        setGraph(newGraph);
                      }}
                    />
                    <Button
                      onClick={() => {
                        const newConnections = { ...dialogContent.nodeConnections };
                        delete newConnections[node];

                        const newGraph = { ...graph };
                        if (newGraph[node]) {
                          delete newGraph[node][dialogContent.nodeName];
                        }

                        setDialogContent({ ...dialogContent, nodeConnections: newConnections });
                        setGraph(newGraph);
                      }}
                    >
                      Usuń
                    </Button>
                  </div>
                ))}

              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)} color="primary">
                Zamknij
              </Button>
              <Button
                onClick={() => {
                  const newGraph = { ...graph };
                  newGraph[dialogContent.nodeName] = dialogContent.nodeConnections;
                  setGraph(newGraph);
                }}
                color="primary"
              >
                Zapisz
              </Button>
            </DialogActions>
          </Dialog>
        </div>

      </div>
    </ThemeProvider>
  );
}