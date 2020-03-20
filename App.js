/* eslint-disable quotes */
/* eslint-disable prettier/prettier */

import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  FlatList,
  Alert,
} from 'react-native';

var lastSelected = 0;
var maxNumber = 18;
var currentLevel = 1;
var numColumns = 3;

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function generateItems(array) {
  var arr = [];
  for (var i = 0; i < array.length; i++){
    arr.push({id: i, number: array[i], isSelected: false});
  }

  return arr;
}

var sequenceArray = function() {
  var maxNumberDefault = Math.pow(numColumns,2) + 1;
  var arr = Array.from(Array(maxNumberDefault).keys());
  arr.shift();

  return arr;
};

export default class App extends Component {

  state = {
    dataSource: [],
  }
  
  constructor(props) {
    super(props);
    this.onPress = this.onItemPressed.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onBtnLevelUpPress = this.onLevelUp.bind(this);
    this.onBtnLevelDownPress = this.onLevelDown.bind(this);
    this.stopWatchReference = React.createRef();
  }

  onItemPressed(item) {
    if(item.number === 1){
      this.stopWatchReference.current.start();
    }

    if (item.number === lastSelected + 1) {
      if (item.number === maxNumber) {
        this.stopWatchReference.current.stop();
        Alert.alert("Congratz!", "You win", "OK");
      }
      else {
        var maxInTable = Math.max.apply(Math, this.state.dataSource.map(i => i.number));
        item.number = maxInTable >= maxNumber ? item.number : maxInTable + 1;
        item.isSelected = !item.isSelected;
        this.state.dataSource[item.id] = item;
        lastSelected += 1;
        this.setState({
          dataSource: this.state.dataSource,
        });
      }
    }
    else {
      this.stopWatchReference.current.stop();
      Alert.alert("Oops!", "You lose", "OK");
    }
  }

  onLevelUp(){
    if (currentLevel === 5)
      return;
    currentLevel += 1;
    this.onLevelChanged();
  }

  onLevelDown(){
    if (currentLevel === 1)
      return;
    currentLevel -= 1;
    this.onLevelChanged();
  }

  onLevelChanged(){
    numColumns = currentLevel + 2;
    maxNumber = Math.pow((currentLevel + 2), 2) * 2;
    this.onReset();
  }

  onReset(){
    lastSelected = 0;
    this.time = "00:00";
    clearInterval(this.timer);
    this.setState({ dataSource: generateItems(shuffle(sequenceArray()))});
    this.stopWatchReference.current.reset();
  }

  componentDidMount() {
    this.onReset();
  }

  itemStyle = function(isSelected) {
    return  {
      backgroundColor: isSelected ? '#6e3b6e' : '#f9c2ff',
      padding: 5,
      marginVertical: 5,
      marginHorizontal: 5,
      alignContent: 'center',
      justifyContent: 'center',
      height: 340 / numColumns,
      width: 340 / numColumns,
    };
  }

  itemTextStyle = function() {
    return {
      fontSize: 32 - (currentLevel * 2),
      justifyContent: 'center',
      alignContent: 'center',
      textAlign: 'center',
    };
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.header}>
            1 To 50
          </Text>
          <View style={styles.horizontalView}>
            <View style={styles.levelView}>
              <Button style={styles.button} title="<" onPress={this.onBtnLevelDownPress}/>
              <Text style={styles.buttonText}>Level {currentLevel}</Text>
              <Button style={styles.button} title=">" onPress={this.onBtnLevelUpPress}/>
            </View>
            <StopWatch ref={this.stopWatchReference}/>
            <Button onPress={this.onReset} title="Reset" style={styles.button}/>
          </View>
        </View>
        <FlatList
          style={styles.flatList}
          data={this.state.dataSource}
          renderItem={({ item }) =>
            <TouchableOpacity style={this.itemStyle(item.isSelected)} onPress={() => this.onPress(item)}>
              <Text style={this.itemTextStyle()}>{item.number}</Text>
            </TouchableOpacity>
          }
          numColumns={numColumns}
          keyExtractor={item => item.id}
          extraData={this.state}
          key = {numColumns}
        />
      </SafeAreaView>
    );
  }
}

class StopWatch extends Component {
  state = {
      timer: null,
      counter: '00',
      miliseconds: '00',
  }

  reset = () => {
    this.setState({
      timer: null,
      counter: '00',
      miliseconds: '00',
    });
  }

  start = () => {
      var self = this;
      let timer = setInterval(() => {
          var num = (Number(this.state.miliseconds) + 1).toString(),
              count = this.state.counter;

          if( Number(this.state.miliseconds) == 99 ) {
              count = (Number(this.state.counter) + 1).toString();
              num = '00';
          }

          self.setState({
              counter: count.length === 1 ? '0' + count : count,
              miliseconds: num.length === 1 ? '0' + num : num,
          });
      }, 0);
      this.setState({timer});
  }

  stop = () => {
    clearInterval(this.state.timer);
  }

  render() {
      return (
        <Text style={styles.counter}>{this.state.counter}:{this.state.miliseconds}</Text>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 32,
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 24,
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 40,
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    backgroundColor: '#e1e1ff',
    color: 'green',
    marginVertical: 20,
    paddingTop: 20,
    height: 100,
  },
  flatList: {
    marginTop: 40,
    alignSelf: 'center',
  },
  horizontalView: {
    flexDirection: 'row',
    backgroundColor: '#c0d6c0',
    justifyContent: 'space-evenly',
    height: 70,
    paddingTop: 15,
  },
  levelView: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  button: {
    padding: 8,
    backgroundColor: 'steelblue',
    alignSelf: 'stretch',
    justifyContent: 'center',
    fontSize: 24,
  },
  counter: {
    fontSize: 32,
    textAlign: 'center',
  },
});
