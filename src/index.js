/**
* Basically, this middleware allows you to have a special type of action, a "signal" doesn't update the
* reducers itself, but instead invokes an one or more actions or actionCreators, passing along its data.
*/
export default function createSignalMiddleware(signalMapping){

  return store => next => action => {
    if(action.type && signalMapping[action.type] !== undefined){
      let signalActionOrCreator = signalMapping[action.type];
      if(Array.isArray(signalActionOrCreator)){
        return signalActionOrCreator.reduce(reduceSignal, store.getState());
      }else{
        return reduceSignal(store.getState(), signalActionOrCreator);
      }
    }else{
      return next(action);
    }

    function reduceSignal(state, actionOrCreator){
      let newAction;
      if(typeof actionOrCreator === 'function'){
        //Action creator, pass it the current action as input.
        newAction = actionOrCreator(action);
      }
      else if(typeof actionOrCreator === 'string'){
        //Name of action to call, create an action for it, passing along all the current action's data.
        newAction = Object.assign({}, action);
        newAction.type = actionOrCreator;
      }else if(actionOrCreator.type){
        //action object, with properties to pass.  Overlay passed properties on top of current action.
        newAction = Object.assign({}, action, actionOrCreator);
      }else{
        throw new Error('Unknown mapping for signal ``'+  action.type + '``. Expected function, action object, or string, got: ' + actionOrCreator)
      }
      return store.dispatch(newAction);
    }
  }
}
