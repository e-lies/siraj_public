import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Button, IconButton, Icon, Tooltip, Badge, CircularProgress } from '@material-ui/core';
import Alerts from '../components/Alerts';
import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';

var transerRecognizer;

export const SpeechContext = React.createContext({
    openConfig: ()=>{},
    words: [],
    dataset: null,
    model: null,
    recognize: () =>{},
});

function SpeechBoard(props){
    const { add, remove, collectSample, examples, count } = props
    const addWord = ()=>{
        let word = window.prompt("Entrez le nouveau mot à apprendre")
        add(word)
    }
    return(
        <div id="speechBoard" style={{display:'flex',flexDirection:'column',alignContent:'center'}}>
            <IconButton onClick={addWord} color="primary"><Icon fontSize="large">add_list</Icon></IconButton>            
            <List id="words" component="ol">
            {
                Object.keys(examples).map(word=>{
                    return(
                        <ListItem key={`item${word}`}><Tooltip title={examples[word]['description'] || null}>
                            <h5> id: {examples[word]['id']} </h5>
                            <Badge badgeContent={count[word]}> <h5> {word} </h5> </Badge>
                            <Tooltip title={`Ajouter un exemple au mot ${word}`}>
                                <IconButton onClick={e=>collectSample(word)} color="primary"><Icon fontSize="large">add</Icon></IconButton>
                            </Tooltip>
                            <Tooltip title={`Supprimer le mot ${word} du dataset`}>
                                <IconButton onClick={e=>remove(word)} color="secondary"><Icon fontSize="large">delete</Icon></IconButton>
                            </Tooltip>
                        </Tooltip></ListItem>
                    )
                })
            }
            </List>
        </div>
    )
}
export default class SpeechRecognition extends React.Component {
    state = {
        configOpened: false,
        count: {},
        examples: {},
        dataset: null,
        model: null,
        isTraining: false
    }
    componentDidMount(){
        transerRecognizer = speechCommands.create('BROWSER_FFT');
        transerRecognizer.ensureModelLoaded();
        /*let mod = localStorage.getItem("SpeechModel")
        if(mod){
            const model = tf.loadLayersModel('localstorage://SpeechModel');
        }
        else{
            const model = 
        }*/
        const dataset = localStorage.getItem("SpeechDataset")
        if(dataset){
            const clearExisting = false;
            transerRecognizer.loadExamples(dataset,clearExisting)
        }
        //this.setState({model})
    }
    addWord = (w) =>{
        let count = this.state.count
        count[w] = 0
        this.setState({count})
    }
    collectSample = (word) =>{
        let count = this.state.count
        count[word]++
        transerRecognizer.collectExample(word)
        this.setState({count})

    }
    train = () =>{
        console.log(transerRecognizer.countExamples());
        const serialized = transerRecognizer.serializeExamples();
        transerRecognizer.train({
          epochs: 20,
          callback: {
            onEpochEnd: async (epoch, logs) => {
                  console.log(`Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.acc}`);
               }
         }
        });
    }
    recognize = (w) =>{
        transerRecognizer.listen(result => {
            console.log(result)
          // - result.scores contains the scores for the new vocabulary, which
          //   can be checked with:
          const words = transerRecognizer.wordLabels();
          console.log(words)
          // `result.scores` contains the scores for the new words, not the original
          // words.
          for (let i = 0; i < words.length; ++i) { console.log(i)
            console.log(`score for word '${words[i]}' = ${result.scores[i]}`);
          }
        }, {
            probabilityThreshold: 0.75,
            overlapFactor: 0.999,
               includeSpectrogram: true,
               invokeCallbackOnNoiseAndUnknown: true
        });
    
        // Stop the recognition in 10 seconds.
        setTimeout(() => transerRecognizer.stopListening(), 50e2);
    }

    render(){
        return(
            <SpeechContext.Provider
                value={{
                    openConfig: ()=>this.setState({configOpened:true}),
                    addWord: (w) => this.addWord(w),
                    recognize: (sound) => this.recognize(sound)                    
                }}
            >
                {
                    this.state.isTraining && <CircularProgress size={300} color="secondary" />
                }                
                <Alerts
                    open={this.state.configOpened}
                    type="confirm"
                    title="Configuration commande vocale"
                    draggable
                    onOk={()=>{ 
                        
                    }}
                    handleClose={() => this.setState({configOpened:false})}
                >
                    <div>
                    <SpeechRecognition 
                        add={this.addWord}
                        remove={this.removeWord}
                        collectSample={this.collectSample}
                        count={this.state.count}
                        examples={this.state.examples}                        
                    />
                    <Button color="primary" onClick={this.train}> Train </Button>
                    </div>
                </Alerts>
            </SpeechContext.Provider>
        )
    }
    
}
