import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSignalMiddleware from '../dist/index.js';

test('Dispatching a signal to an action by name', 1, () => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': 'action1'
  });
  const createStoreWithMiddleware = applyMiddleware(signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  store.dispatch({type:'signal1', payload:'setAction1'});
  equal(store.getState().action1,  'setAction1');
});

test('Dispatching a signal to muliple actions by name', 2, () => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': ['action1', 'action2']
  });
  const createStoreWithMiddleware = applyMiddleware(signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  store.dispatch({type:'signal1', payload:'setFromSignal'});
  equal(store.getState().action1,  'setFromSignal');
  equal(store.getState().action2,  'setFromSignal');
});

test('Dispatching a signal to an action object', 1, () => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': {type:'action1', payload:'Value from Action'}
  });
  const createStoreWithMiddleware = applyMiddleware(signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  store.dispatch({type:'signal1', payload:'setFromSignal'});
  equal(store.getState().action1,  'Value from Action');
});

test('Dispatching a signal to multiple action objects', 2, () => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': [
      {type:'action1', payload:'Value from Action'},
      {type:'action2', payload:'Set by Action'}
    ]
  });
  const createStoreWithMiddleware = applyMiddleware(signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  store.dispatch({type:'signal1', payload:'setFromSignal'});
  equal(store.getState().action1,  'Value from Action');
  equal(store.getState().action2,  'Set by Action');
});


test('Dispatching a signal to an action creator', 1, () => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': ({payload}) => {return {type:'action1', payload:payload + ' with secret sauce.'}}
  });
  const createStoreWithMiddleware = applyMiddleware(signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  store.dispatch({type:'signal1', payload:'set from signal'});
  equal(store.getState().action1,  'set from signal with secret sauce.');
});

test('Dispatching a signal to multiple action creators', 2, () => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': [
      ({payload}) => {return {type:'action1', payload:payload + ' with secret sauce.'}},
      ({payload}) => {return {type:'action2', payload:payload + ' with extra mustard.'}}
    ]
  });
  const createStoreWithMiddleware = applyMiddleware(signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  store.dispatch({type:'signal1', payload:'set from signal'});
  equal(store.getState().action1,  'set from signal with secret sauce.');
  equal(store.getState().action2,  'set from signal with extra mustard.');
});

test('Dispatching an action creator that returns a thunk', 1, (done) => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': ({payload}) => {
      return (dispatch, getState) => {
        setTimeout(()=>{
          dispatch({type:'action1', payload:payload + ' with deferred secret sauce.'});
        });
      }
    }
  });
  const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  store.subscribe(()=>{
    equal(store.getState().action1,  'set from signal with deferred secret sauce.');
    done();
  })
  store.dispatch({type:'signal1', payload:'set from signal'});
});

test('Complex case with a signal that dispatches an action creator that returns a thunk that dispatches another signal', 2, (done)=>{
  const signalMiddleware = createSignalMiddleware({
    'signal1': ({payload}) => {
      return (dispatch, getState) => {
        setTimeout(()=>{
          dispatch({type:'signal2', payload:payload + ' with deferred secret sauce.'});
        });
      }
    },
    'signal2':['action1', {type:'action2', payload:'set by action2 object'}]
  });
  const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);
  let callcount = 0;
  store.subscribe(()=>{
    if(callcount === 0){
      equal(store.getState().action1,  'set from signal1 with deferred secret sauce.');
    }
    if(callcount === 1){
      equal(store.getState().action2,  'set by action2 object');
      done();
    }
    callcount++;
  })
  store.dispatch({type:'signal1', payload:'set from signal1'});
});

test('Passing junk to createSignalMiddleware throws error', 6, () => {
  const signalMiddleware = createSignalMiddleware({
    'signal1': new Date(),
    'signal2': Infinity,
    'signal3': 5,
    'signal4': true,
    'signal5': null,
    'signal6': 0
  });
  const createStoreWithMiddleware = applyMiddleware(signalMiddleware)(createStore);
  const store = createStoreWithMiddleware(simpleReducer);

  throws(()=>{
    store.dispatch({type:'signal1', payload:'setAction1'});
  });
  throws(()=>{
    store.dispatch({type:'signal2', payload:'setAction1'});
  });
  throws(()=>{
    store.dispatch({type:'signal3', payload:'setAction1'});
  });
  throws(()=>{
    store.dispatch({type:'signal4', payload:'setAction1'});
  });
  throws(()=>{
    store.dispatch({type:'signal5', payload:'setAction1'});
  });
  throws(()=>{
    store.dispatch({type:'signal6', payload:'setAction1'});
  });
});



function simpleReducer(state={}, action){
  switch(action.type){
    case 'action1':
      return Object.assign({}, state, {
        'action1': action.payload
      });
    case 'action2':
      return Object.assign({}, state, {
        'action2': action.payload
      });
    case 'signal1':
      throw new Error('This should never be called');
    case 'signal2':
      throw new Error('This should never be called');
    default:
      return state;
  }
}
