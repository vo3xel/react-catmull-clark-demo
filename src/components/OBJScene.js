import * as THREE from "three";
import React from "react";
import React3 from "react-three-renderer";
import ObjectModel from 'react-three-renderer-objects';
import Material from "../assets/axes.mtl";
import TrackballControls from "three-trackballcontrols"
import ReactDOM from 'react-dom';

class OBJScene extends React.Component {
constructor(props) {
    super(props);
    this.state = {
      scene: {},
      model: this.props.model,
      material: Material,
    };
    console.log("(OBJScene) -> " + this.state.model)
  }


componentDidMount() {
    const { scene } = this.refs;
    const controls = new TrackballControls(this.refs.mainCamera, ReactDOM.findDOMNode(this.refs.react3));
    this.controls = controls;
    var pointLight = new THREE.PointLight( 0xffffff, 1, 100 ); 
    this.refs.mainCamera.add( pointLight );
    this.setState({ scene });
  }

  componentWillUnmount() {  
    this.controls.dispose();
    delete this.controls;
 }
 
 _onAnimate = () => { this.controls.update(); };

render() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    return (
      <React3
        mainCamera="camera"
        width={width-100}
        height={height-100}
        ref="react3"
        onAnimate={this._onAnimate}
      >
        <scene ref="scene"
        fog = { new THREE.Fog() }
        >
          <perspectiveCamera
            key={`perspectiveCamera`}
            name="camera"
            fov={50}
            aspect={width / height}
            near={0.5}
            far={1000}
            ref="mainCamera"
            position={new THREE.Vector3(0, 10, 10)}
            lookAt={new THREE.Vector3(0, 0, 0)}
          />

          <group name="objectGroup" ref="objgroup">
            <ObjectModel
              name="model"
              model={this.state.model}
              material={this.state.Material}
              scene={this.state.scene}
              group="objectGroup"
            />
          </group>
        </scene>
      </React3>
    );
  }
}
export default OBJScene;