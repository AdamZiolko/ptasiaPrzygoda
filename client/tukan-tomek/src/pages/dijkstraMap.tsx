import React, { useEffect, useRef, useState } from 'react';
import paper from 'paper';
import './dijkstraMap.css';
import { Button, createMuiTheme, createTheme, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, makeStyles, SvgIcon, TextField, ThemeProvider } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import { useMediaQuery } from 'react-responsive';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

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
  iconButton: {
    '&:focus': {
      outline: 'none',
    },
  },
  floatingButton: {
    position: 'fixed',
    bottom: theme.spacing(2),
  },
  primaryButton: {
    height: theme.spacing(7),

    right: theme.spacing(2),
  },
  secondaryButton: {
    color: 'black',
    right: theme.spacing(14),
  },
  thirdButton: {
    color: 'black',
    right: theme.spacing(14),
    bottom: theme.spacing(6),
  },
  trashButton: {
    right: theme.spacing(46),
    width: theme.spacing(7),
    bottom: theme.spacing(3),
    height: theme.spacing(7),
    boxShadow: '0 0 10px 5px rgba(255, 0, 0, 0.5)', // 
    '& svg': { // 
      fontSize: '2rem',
    },
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
  const [nodeToDeletion, setNodeToDeletion] = useState(null);
  const [trashIsClicked, setTrashIsClicked] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  let highestLetter = '';
  let lowestLetter = '';

  const handleTrashClick = () => {
    if (switchEdit) setSwitchEdit(!switchEdit)
    if (switchState) setSwitchState(!switchState)

    setTrashIsClicked(prevTrashIsClicked => {
      const newTrashIsClicked = !prevTrashIsClicked;
      console.log(newTrashIsClicked, 'trash button clicked');
      if (newTrashIsClicked) {
        setSnackbarOpen(true); // 
      }
      return newTrashIsClicked;
    });
  };

  const changeSwitchState = () => {
    if (switchEdit) setSwitchEdit(!switchEdit)
    if (trashIsClicked) setTrashIsClicked(!trashIsClicked)
    setSwitchState(prevSwitchState => {
      const newSwitchState = !prevSwitchState;
      console.log(newSwitchState, 'czy wlaczany');
      return newSwitchState;
    });
  };

  const changeSwitchEdit = () => {
    if (switchState) setSwitchState(!switchState)
    if (trashIsClicked) setTrashIsClicked(!trashIsClicked)

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

  function changeNodeColor(nodeKey: string, color: string, i: boolean = true ) {
    if(i){
    circles.forEach(circle => {
      if (circle.data.nodeKey === nodeKey) {
        circle.fillColor = new paper.Color(color);
      }
    });
  } else {
    const centerX = paper.view.size.width / 2;
    const centerY = paper.view.size.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    const position = nodePositions[nodeKey] || new paper.Point(
      centerX + radius * Math.cos(45),
      centerY + radius * Math.sin(45)
    );
    circles.forEach(circle => {
      if (circle.data.nodeKey === nodeKey) {

      let gradient = new paper.Gradient(['#AA076B', '#61045F'], false);
      let gradientColor = new paper.Color(gradient, position, position.add([30, 30]));
      circle.fillColor = gradientColor;
      }
    })

  }
}

  ///////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (canvasRef.current) {
      paper.setup(canvasRef.current);
      paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);
  



      let middleButtonPressed = false;
      let lastPoint: null = null;

      let lerpFactor = 0.8; 

      const onMouseDown = function(event) {
        if (event.event.button === 1) {
          event.preventDefault();
          middleButtonPressed = true;
          lastPoint = event.point;
        }
      }
  
      const onMouseDrag = function(event) {
        if (middleButtonPressed) {
          event.preventDefault();
          const delta = event.point.subtract(lastPoint);
          const newCenter = paper.view.center.subtract(delta);
          paper.view.center = paper.view.center.add(newCenter.subtract(paper.view.center).multiply(lerpFactor));
          lastPoint = event.point;
        }
      }
  
      const onMouseUp = function(event) {
        if (event.event.button === 1) {
          middleButtonPressed = false;
        }
      }
  
      const onWheel = function(event) {
        event.preventDefault();
        const zoomFactor = 1.1;
  
        let oldCenter = paper.view.center;
  
        if (event.deltaY < 0) { 
            paper.view.zoom *= zoomFactor;
        } else { 
            paper.view.zoom /= zoomFactor;
        }
  
        paper.view.center = oldCenter;
      }
  
      paper.view.onMouseDown = onMouseDown;
      paper.view.onMouseDrag = onMouseDrag;
      paper.view.onMouseUp = onMouseUp;
      paper.view.element.addEventListener('wheel', onWheel, false);
  
      
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

          const keys = Object.keys(graph);
          const asciiValues = keys.map(key => key.charCodeAt(0));
          const maxAscii = Math.max(...asciiValues);
          const minAscii = Math.min(...asciiValues);
          highestLetter = String.fromCharCode(maxAscii);
          lowestLetter = String.fromCharCode(minAscii);

          let circle;
          if (node === highestLetter || node === lowestLetter) {
            let size = new paper.Size(30 * 2, 30 * 2);
            let topLeftPosition = new paper.Point(position.x - size.width / 2, position.y - size.height / 2);
        
            circle = new paper.Path.Rectangle({
                rectangle: new paper.Rectangle(topLeftPosition, size),
            });
        
            let gradient = new paper.Gradient(['#FFA07A', '#FFD700'], true);
            let gradientColor = new paper.Color(gradient, topLeftPosition, topLeftPosition.add(size));
            circle.fillColor = gradientColor;
        
            circle.shadowColor = new paper.Color(0, 0, 0);
            circle.shadowBlur = 12;
            circle.shadowOffset = new paper.Point(5, 5);


        } else {
            circle = new paper.Path.Circle({
                center: position,
                radius: 30,
            });
        
            let gradient = new paper.Gradient(['#FFA07A', '#FFD700'], false);
            let gradientColor = new paper.Color(gradient, position, position.add([30, 30]));
            circle.fillColor = gradientColor;
        
            circle.shadowColor = new paper.Color(0, 0, 0);
            circle.shadowBlur = 12;
            circle.shadowOffset = new paper.Point(5, 5);
        }
        circle.data.nodeKey = node;

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
              nodePositions[node] = newPosition; 
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

              if (trashIsClicked) {
                const newGraph = { ...graph };

                for (let otherNode in newGraph) {
                  if (newGraph[otherNode][node]) {
                    delete newGraph[otherNode][node];
                  }
                }

                delete newGraph[node];

                setGraph(newGraph);
                return;
              }

              if (switchEdit) {
                setEditedNode(node);

                

                changeAllCirclesColor('red');


                let gradient = new paper.Gradient(['#FFA07A', '#9370DB'], false);
                let gradientColor = new paper.Color(gradient, position, position.add([30, 30]));
                this.fillColor = gradientColor;
                
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
          let addedTexts = {}; 
          Object.keys(graph).forEach(node => {

            let nodeContent = node.toUpperCase(); 

            if (node === highestLetter) {
              nodeContent = 'Koniec';
            } else if (node === lowestLetter) {
              nodeContent = 'Start';
            }

            const nodeText = new paper.PointText({
              point: new paper.Point(
                node === movedNode ? newPosition.x : nodePositions[node].x,
                (node === movedNode ? newPosition.y : nodePositions[node].y) + 12 // 
              ),
              content: nodeContent, // 
              fillColor: 'black',
              justification: 'center',
              fontSize: 24, 
              fontWeight: 'bold' // 
            });
            edgePaths.push(nodeText);  // 

            Object.keys(graph[node]).forEach(neighbor => {
              const path = new paper.Path.Line({
                from: node === movedNode ? newPosition : nodePositions[node],
                to: nodePositions[neighbor],
                strokeColor: 'grey'
              });
              edgePaths.push(path);

              // 
              let nodePair = [node, neighbor].sort().join('-');

              // 
              if (!addedTexts[nodePair]) {
                const midPoint = path.getPointAt(path.length / 2);
                const weightText = new paper.PointText({
                  point: midPoint,
                  content: graph[node][neighbor],
                  fillColor: 'black',
                  justification: 'center',
                  fontSize: 18
                });
                edgePaths.push(weightText); // 
                addedTexts[nodePair] = true; 
              }
            });
          });
        };
        redrawEdges();
      };

      drawGraph();
      const handleResize = () => {
        paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);
        drawGraph();
      };

      ////////////////////////////////////////////////////////////////////////////////
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        paper.view.off('mousedown', onMouseDown);
        paper.view.off('mousedrag', onMouseDrag);
        paper.view.off('mouseup', onMouseUp);
        paper.view.element.removeEventListener('wheel', onWheel);
  
        paper.project.clear();
  
      };
    }
  }, [graph, selectedNodes, switchState, switchEdit, trashIsClicked]);


  useEffect(() => {
    console.log("wezly ", selectedNodes)
    changeNodeColor(selectedNodes[0], 'red', false);
    if (selectedNodes.length === 2) {
      addEdge();
      // zmienia kolor obu wybranych węzłów na czerwony

    }
  }, [selectedNodes]);


  return (
    <ThemeProvider theme={theme}>
      <div className="canvas-container">
        <canvas ref={canvasRef} className="full-page-canvas" />
        <Button variant="contained" color="primary" onClick={addNode} className={`${classes.floatingButton} ${classes.primaryButton}`}>+ węzeł</Button>


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
        <IconButton onClick={handleTrashClick} style={{ color: trashIsClicked ? 'red' : 'black' }} className={`${classes.floatingButton} ${classes.trashButton} ${classes.iconButton}`} >
          <SvgIcon>
            <path d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.5l1-1h7l1 1h5.5z" />
          </SvgIcon>
        </IconButton>


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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity="error">
          Tryb usuwania włączony! Kliknij na węzeł, aby go usunąć.
        </MuiAlert>
      </Snackbar>
    </ThemeProvider>
  );
}