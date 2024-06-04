import React, {useEffect, useState} from 'react';
import { Text, Button, SafeAreaView, FlatList, View, Pressable, Alert, TouchableHighlight, TextInput, ScrollView } from 'react-native';
import Styles from '../StyleSheet';
import firestore from '@react-native-firebase/firestore';
import DatePicker from '../components/DatePicker';
import EmptyState from '../components/EmptyState';
import dayjs from 'dayjs';

var nav;

const ListItem = ({id, time, name, deleteItem}) => {
  let date = new Date(parseFloat(time));
  date = (date.getMonth()+1) + '/' + date.getFullYear();
  const chitFund = {id, name, date};
  return (
      <Pressable
      onPress={()=>nav.navigate('ChitFundTransaction', {chitFund})}
      onLongPress={() => deleteItem(id)}
      style={Styles.memoryListItem}>
          <Text>{date}</Text>
          <Text>{name}</Text>
      </Pressable>
  )
}

export default function({navigation}){
    nav = navigation;
    const [loading, setLoading] = useState(true); // Set loading to true on component mount
    const [chitFunds, setChitFunds] = useState([]); // Initial empty array of chitFunds
    const [date, setDate] = useState(dayjs());// check new Date()
    const [name, setName] = useState('');
    const [canAdd, setCanAdd] = useState(false); // Toggles add container

    const onSnapshot = async(docs) => {
        const chitFunds = [];
          docs.forEach(doc => {
            chitFunds.push({
              ...doc.data(),
              id: doc.id,
            });
          });
          setChitFunds(chitFunds);
          setLoading(false);
    }
    const addItem = () => {
      if(!canAdd){
        setCanAdd(true);
        return;
      }
      if(name == ''){
        Alert.alert('Error', 'Please provide a chit fund name to create entry.');
        return;  
      }
      firestore()
        .collection('ChitFunds')
        .add({
          time: date.$d.getTime().toString(),
          name: name,
        })
        .then((a) => {
          console.log('A memory added!');
          setCanAdd(false);
          });
    }
    const deleteItem = (id) => {
      Alert.alert('Delete Item', 'Do you want delete this item?', [
        {
          text: 'Delete',
          onPress: () => {
            firestore()
            .collection('ChitFunds')
            .doc(id)
            .delete()
            .then(() => {
              console.log('The memory deleted!' + id);
            }).catch((err) => {
              console.log(err);
            });
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        }
      ]);
    }
    useEffect(() => {
      const subscriber = firestore()
        .collection('ChitFunds')
        .orderBy('time', 'desc')
        .onSnapshot(onSnapshot);
  
      // Unsubscribe from events when no longer in use
      return () => subscriber();
    }, []);
    return (
        <SafeAreaView style={Styles.manageCanContainer}>
            {
              canAdd ? (
                <>
                  <DatePicker date={date} updateSelectedDate={setDate}></DatePicker>
                  <TextInput
                  value={name}
                  onChangeText={c=>setName(c)}
                  style={Styles.numberOfCansInput}
                  placeholder='Enter the name of chit fund.'
                  // placeholderTextColor='black'
                  />
                </>
              ) : ''
            }
            <TouchableHighlight
            style={Styles.manageCanButton}
            underlayColor="#DDDDDD"
            onPress={addItem}>
                <Text style={Styles.addCanButtonText}>Add Chit Fund</Text>
            </TouchableHighlight>
            <View
            style={Styles.memoriesView}>
              <Text style={Styles.listHeading}>Chit Funds</Text>
              <FlatList
              data={chitFunds}
              keyExtractor={item=>item.id}
              ListEmptyComponent={EmptyState}
              renderItem={({ item }) => <ListItem {...item} deleteItem={deleteItem}/>}
              />
            </View>
        </SafeAreaView>
    )
}