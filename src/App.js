import React, { Component } from 'react';
import './App.css';
import OBJScene from './components/OBJScene';
import Model1 from "./assets/axes.obj";
import Model2 from "./assets/cube.obj";
import Model3 from "./assets/pyramid.obj";
import * as THREE from 'three';
import * as OBJLoader from 'three-obj-loader';
import * as CatmullClark from 'gl-catmull-clark'
import UploadIcon from "./assets/53418.svg"
import ReactDOM from 'react-dom';
import Modal from 'react-responsive-modal';
import { FilePicker } from 'react-file-picker'
import FPSStats from "react-fps-stats";

OBJLoader(THREE);

class App extends Component {
  constructor(props) {
    super(props);
    this.THREE = THREE;
    this.objLoader = new this.THREE.OBJLoader();
    this.state = {
      model: null,
      open: false,
      modelFileUploaded: null,
      uploadedModelFileName: 'Custom model'
    };
  }

  onOpenModal = () => {
    this.setState({ open: true });
  };

  onCloseModal = () => {
    this.setState({ open: false });
    this.setState({ fileUploadError: false });
  };

  exportOBJToFile(mesh){
    var vertexExport = mesh.positions.map((vertexline) => {
        return "v " + vertexline[0].toLocaleString('fullwide', {useGrouping:false, minimumFractionDigits:6}).replace(",",".") + " " + vertexline[1].toLocaleString('fullwide', {useGrouping:false, minimumFractionDigits:6}).replace(",",".") + " " + vertexline[2].toLocaleString('fullwide', {useGrouping:false, minimumFractionDigits:6}).replace(",",".")
    })
    var facesExport = mesh.cells.map((faceline) => {
      return "f " + (faceline[0]+1) + " " + (faceline[1]+1) + " " + (faceline[2]+1) + " " + (faceline[3]+1)
  })
    var file = new Blob([vertexExport.join("\n") + "\n" + facesExport.join("\n")], {type: 'text/plain'});
    return  URL.createObjectURL(file);
  }

  importOBJFromFile(model){
    return new Promise(function(resolve, reject){
    fetch(model)
    .then((r) => r.text())
    .then(objfilecontent  => {
      var obj = {};
      var vertexMatches = objfilecontent.match(/^v( -?\d+(\.\d+)?){3}$/gm);
      if (vertexMatches)
      {
        obj.vertices = vertexMatches.map(function(vertex)
          {
            var vertices = vertex.split(" ");
            vertices = vertices.map((vertex) => parseFloat(vertex))
            vertices.shift();
            return vertices;
          });
      }
      var vertexNormalsMatches = objfilecontent.match(/^vn( -?\d+(\.\d+)?){3}$/gm);
      if (vertexNormalsMatches)
      {
        obj.vertexnormals = vertexNormalsMatches.map(function(vn)
          {
            var vertexnormals = vn.split(" ");
            vertexnormals.shift();
            vertexnormals = vertexnormals.map((vertexnormal) => parseFloat(vertexnormal))
            return vertexnormals;
          });
      }
      var facesMatches = objfilecontent.match(/^f( \d+\/\/\d+){4}$/gm);
      if (facesMatches)
      {
        obj.faces = facesMatches.map(function(vn)
          {
            vn = vn.replace(/\/\//g, " ");
            var faces = vn.split(" ");
            faces.shift();
            return [ Number(faces[0])-1, Number(faces[2])-1, Number(faces[4])-1, Number(faces[6])-1 ];
          });
      }
      resolve(obj);
    })
    .catch((err) => resolve(err))
  })
}

  calculateCatmullClark(model, lod){
    this.importOBJFromFile(model)
    .then((obj) => {
      var mesh =  CatmullClark(obj.vertices, obj.faces, lod, false)
      var model = this.exportOBJToFile(mesh)
      this.setState({ model: model })
    })
  }

  handleFileUpload(fileObject){
    if(fileObject.size/1024/1024 >= 5){
      console.error("File too big: > 5MB")
      return
    }
    console.log(fileObject )
    var reader = new FileReader();
    reader.onload = (e) => {
      var text = reader.result;
      var file = new Blob([text], {type: 'text/plain'});

      var model = URL.createObjectURL(file);
      this.setState({ modelFileUploaded: model, uploadedModelFileName: fileObject.name}, () => this.loadModel(4, 0))
      this.onCloseModal()
    }
    reader.readAsText(fileObject)
  }
  
  loadModel(index, lod){
    console.log(index, lod);
    this.setState({ model: null }, () => {
      var model = {}
      if(index === 1){
        model = Model1
      }
      if(index === 2){
        model = Model2
      }
      if(index === 3){
        model = Model3
      }
      if(index === 4){
        console.log(this.state.modelFileUploaded)
        model = this.state.modelFileUploaded
      }
      if(lod === 0){
        this.setState({ model: model }, (model) = console.log("* " + model));
      }
      else{
        this.calculateCatmullClark(model, lod);
      }
    });
  }

  modalError(){
    this.setState({ fileUploadError: true })
  }

  render() {
    const { open } = this.state;
    return (
      <div className="App">
        <ul>
          <li><span style={{ color: 'gray' }}>Catmull-Clark demo</span></li>
          <li className="dropdown">
            <a href="#" onClick={() => {this.loadModel(1, 0)}} className="dropbtn" >Axis</a>
          <div className="dropdown-content">
            <a href="#" onClick={() => {this.loadModel(1, 1)}}>iteration 1</a>
            <a href="#" onClick={() => {this.loadModel(1, 2)}}>iteration 2</a>
            <a href="#" onClick={() => {this.loadModel(1, 3)}}>iteration 3</a>
            <a href="#" onClick={() => {this.loadModel(1, 4)}}>iteration 4</a>
            <a href="#" onClick={() => {this.loadModel(1, 5)}}>iteration 5</a>
          </div>
          </li>
          <li className="dropdown">
            <a href="#" onClick={() => {this.loadModel(2, 0)}} className="dropbtn" >Cube</a>
          <div className="dropdown-content">
            <a href="#" onClick={() => {this.loadModel(2, 1)}}>iteration 1</a>
            <a href="#" onClick={() => {this.loadModel(2, 2)}}>iteration 2</a>
            <a href="#" onClick={() => {this.loadModel(2, 3)}}>iteration 3</a>
            <a href="#" onClick={() => {this.loadModel(2, 4)}}>iteration 4</a>
            <a href="#" onClick={() => {this.loadModel(2, 5)}}>iteration 5</a>
          </div>
          </li>
          <li className="dropdown">
            <a href="#" onClick={() => {this.loadModel(3, 0)}} className="dropbtn" >Pyramid</a>
          <div className="dropdown-content">
            <a href="#" onClick={() => {this.loadModel(3, 1)}}>iteration 1</a>
            <a href="#" onClick={() => {this.loadModel(3, 2)}}>iteration 2</a>
            <a href="#" onClick={() => {this.loadModel(3, 3)}}>iteration 3</a>
            <a href="#" onClick={() => {this.loadModel(3, 4)}}>iteration 4</a>
            <a href="#" onClick={() => {this.loadModel(3, 5)}}>iteration 5</a>
          </div>
          </li>
          { this.state.modelFileUploaded ? (
          <li className="dropdown">
          <a href="#" onClick={() => {this.loadModel(4, 0)}} className="dropbtn" >{this.state.uploadedModelFileName}</a>
        <div className="dropdown-content">
          <a href="#" onClick={() => {this.loadModel(4, 1)}}>iteration 1</a>
          <a href="#" onClick={() => {this.loadModel(4, 2)}}>iteration 2</a>
          <a href="#" onClick={() => {this.loadModel(4, 3)}}>iteration 3</a>
          <a href="#" onClick={() => {this.loadModel(4, 4)}}>iteration 4</a>
          <a href="#" onClick={() => {this.loadModel(4, 5)}}>iteration 5</a>
        </div>
        </li>) : null}
          <li className="dropdown">
          <a href="#" onClick={() => {this.onOpenModal()}} className="dropbtn" ><img src={UploadIcon} style={{width: 20,height: 20}}/></a>
        </li>
      </ul>
        { this.state.model ? (<OBJScene className="scene" ref="objscene" model={ this.state.model }/>) : null}
      <Modal open={open} onClose={this.onCloseModal} center>
      <center>
        <h2>{'Upload OBJ file ( ≤ 5 MB)'}</h2>
        <FilePicker
          extensions={['obj']}
          maxSize={5}
          onChange={FileObject => ( this.handleFileUpload(FileObject) )}
          onError={ errMsg => ( this.modalError() )}
        >
          <button>Upload OBJ</button>
        </FilePicker>
        </center>
      </Modal>
     <FPSStats
      left='650px'
      />
      </div>
    );
  }
}

export default App;
