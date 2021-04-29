import React from 'react';
import ReactDOM from 'react-dom';
import LogicalForm from './logicalForm.js'
import TextCommand from './textCommand.js'
import ListComponent from './listComponent.js'
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

// Renders an Annotation component consisting of a region for displaying text and area for logical form annotation
class TemplateAnnotator extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        command: '',
        value: '',
        name: '',
        currIndex: -1,
        dataset: {},
        fragment: ""
      }
      /* Array of text commands that need labelling */
      this.handleChange = this.handleChange.bind(this);
      this.handleTextChange = this.handleTextChange.bind(this);
      this.handleNameChange = this.handleNameChange.bind(this);
      this.logSerialized = this.logSerialized.bind(this);
      this.componentDidMount = this.componentDidMount.bind(this);
      this.callAPI = this.callAPI.bind(this);
      this.updateLabels = this.updateLabels.bind(this);
      this.selectCommand = this.selectCommand.bind(this);
      this.updateCommandWithSubstitution = this.updateCommandWithSubstitution.bind(this);
    }
  
    componentDidMount() {
      fetch("http://localhost:9000/readAndSaveToFile/get_labels_progress")
        .then(res => res.json())
        .then((data) => { this.setState({ dataset: data }) })
        .then(() => console.log(this.state.dataset))
    }
  
    callAPI(data) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
      fetch("http://localhost:9000/readAndSaveToFile/append", requestOptions)
        .then(
          (result) => {
            console.log(result)
            this.setState({ value: "" })
            alert("saved!")
          },
          (error) => {
            console.log(error)
          }
        )
    }

    handleTextChange(e) {
      this.setState({ command: e.target.value });
    }

    handleNameChange(e) {
      this.setState({ name: e.target.value });
    }
  
    writeLabels(data) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
      fetch("http://localhost:9000/readAndSaveToFile/writeLabels", requestOptions)
        .then(
          (result) => {
            console.log("success")
            console.log(result)
            this.setState({ value: "" })
            alert("saved!")
          },
          (error) => {
            console.log(error)
          }
        )
    }
  
    handleChange(e) {
      this.setState({ value: e.target.value });
    }
  
    updateLabels(e) {
      // Make a shallow copy of the items
      try {
        // First check that the string is JSON valid
        let JSONActionDict = JSON.parse(this.state.value)
        let JSONString = {
          "command": this.state.command,
          "name": this.state.name,
          "logical_form": JSONActionDict
        }
        console.log(JSONString)
        let items = { ...this.state.dataset };
        items[this.state.name] = JSONString
        // Set state to the data items
        this.setState({ dataset: items }, function () {
          try {
            let actionDict = JSONActionDict
            console.log("writing dataset")
            console.log(JSONString)
            this.writeLabels(this.state.dataset)
          } catch (error) {
            console.error(error)
            console.log("Error parsing JSON")
            alert("Error: Could not save logical form. Check that JSON is formatted correctly.")
          }
        });
      } catch (error) {
        console.error(error)
        console.log("Error parsing JSON")
        alert("Error: Could not save logical form. Check that JSON is formatted correctly.")
      }
    }
  
    logSerialized() {
      console.log("saving serialized tree")
      // First save to local storage
      this.updateLabels()
    }

    selectCommand(event, value) {
      // Update the current command selected and render the corresponding action dictionary
      if (value in this.state.dataset) {
        let selectedDict = this.state.dataset[value]
        let logical_form;
        let command;
        if ("logical_form" in selectedDict) {
          logical_form = selectedDict.logical_form
          command = selectedDict.command
        } else {
          logical_form = selectedDict
          command = ""
        }
        this.setState({ 
          command: command, 
          value: JSON.stringify(logical_form),
          name:  value
        })
      } else {
        this.setState({ name: value, value: JSON.stringify({}) })
      }
    }

    updateCommandWithSubstitution(text) {
      // Update state for command
      console.log(text)
      text = this.state.command.replace('X', text)
      console.log(text)
      this.setState({ command: text })
    }
  
  
    render() {
      return (
        <div style={{ padding: 10 }}>
          <Autocomplete
            id="combo-box-demo"
            options={[
              'find the chessboard',
              'where_X', 'come',
              'where_is_X']}
            getOptionLabel={(option) => option}
            getOptionSelected={(option, value) => option === value}
            style={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Choose Command" variant="outlined" />}
            onChange={this.selectCommand}
          />
          <b> {this.props.title} </b>
          <ListComponent value={this.state.command} fullText={this.props.fullText} onChange={this.handleTextChange} />
          <div> Name of template </div>
          <ListComponent value={this.state.name} onChange={this.handleNameChange} />
          <LogicalForm title="Action Dictionary" onChange={this.handleChange} updateCommand={(x) => this.updateCommandWithSubstitution(x)} currIndex={this.state.fragmentsIndex} value={this.state.value} schema={this.props.schema} dataset={this.state.dataset} />
          <div onClick={this.logSerialized}>
            <button>Save</button>
          </div>
        </div>
      )
    }
  }

  export default TemplateAnnotator;