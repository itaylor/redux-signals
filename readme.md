# redux-signals
A redux middleware that allows the creation of 'signal' actions that don't have reducers of their own, but instead dispatch other actions.

How to use
-------------
### Installation
```
npm install redux-signals
```

### Example usage
This will create a middleware that dispatches three actions when the action 'signal_itemSelected' is dispatched.
You can dispatch actions by type, by action object, or by using an action creator to do more complex manipulation.
```js
import { createStore, applyMiddleware } from 'redux';
import createSignalMiddleware from 'redux-signals';
import myRootReducer from './reducer.js';
let signalActionMapping = {
  "signal_itemSelected" : [
    'setActiveItem',
    {type:'closeModalDialog', extra:'stuff'},
    action => {type:'hideDropdownMenus', target: action.id + '_dynamic_id'}
  ]
};
let signalMiddleware = createSignalMiddleware(signalActionMapping);
let store = applyMiddleware(signalMiddleware)(createStore)(myRootReducer);

//The result of the following will be the actions being dispatched.
//{type:'setActiveItem', id:'foo'}
//{type:'closeModalDialog', id:'foo', extra:'stuff'}
//{type:'hideDropdownMenus', target:'foo_dynamic_id'}
store.dispatch({type:'signal_itemSelected', id:'foo'});
```

### Why would I want this?
*  If you've separated your reducers into separate subreducers/domains, you may have the need for actions that are handled by multiple subreducers.  You may already have actions and corresponding reducer cases in the subreducers that that handle the functionality you need.  Instead of adding new new cases to your subreducers for this action, you want to use the existing actions and apply them in a batch.
* Better logging.  This allows you much (but not all) of the flexibility that the thunk middleware provides, while still being a action, with means that it still can be logged like an action by devtools and logging middleware, while thunks are mostly invisible to the logging middleware/devtools.
*  You want to do mapping of actions to urls for using a router such as [redux-action-router](https://www.npmjs.com/package/redux-action-router) and have the need to be able to dispatch complex actions creators or thunks on url change.

### Why not use [redux-batched-actions](https://www.npmjs.com/package/redux-batched-actions)?
Redux-batched-actions is nice and simple, and you should use it if all you want to do is fire several actions in the same dispatch with only one change.  This middleware uses the same approach as it does, with the following differences/additional capabilities.
 1. This allows/forces you to declare the mappings from 'signal' action to other actions in a central location instead of declaring them in action creators as needed.
 2. This can dispatch action creators as well as other actions.
 3. Action creators are passed the original action as their input.  This allows for chaining of action creators, passing the original action with any parameters it may have through to the called action creators.  


### MIT License
Copyright (c) 2015 Ian Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
