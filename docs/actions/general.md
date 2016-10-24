## Modules

<dl>
<dt><a href="#module_general">general</a> : <code>object</code></dt>
<dd><p>The basic building blocks of a yanatra script.
All actions should return a protractor {promise}</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#combineExports">combineExports(otherModules)</a> ⇒</dt>
<dd><p>Iterate over each module and copy their actions into the top-level actions object.</p>
<p>Note that an action with the same name/key as a previous module will override that module&#39;s action when merging in.</p>
</dd>
</dl>

<a name="module_general"></a>

## general : <code>object</code>
The basic building blocks of a yanatra script.
All actions should return a protractor {promise}


* [general](#module_general) : <code>object</code>
    * [.init()](#module_general.init)
    * [.goto(url)](#module_general.goto)
    * [.get()](#module_general.get)
    * [.scrollTo(scroll)](#module_general.scrollTo)
    * [.ignoreSync()](#module_general.ignoreSync)
    * [.upload(filepath)](#module_general.upload)
    * [.selectOption(obj)](#module_general.selectOption)
    * [.click(obj)](#module_general.click)
    * [.submit()](#module_general.submit)
    * [.type(obj)](#module_general.type)
    * [.sleep(time)](#module_general.sleep)
    * [.waitForElement(el)](#module_general.waitForElement)
    * [.run(script)](#module_general.run)
    * [.screenshot([name])](#module_general.screenshot)
    * [.skip()](#module_general.skip)
    * [.execute(script)](#module_general.execute)
    * [.remember(obj)](#module_general.remember)
    * [.log(variable)](#module_general.log)
    * [.injectCSS(css)](#module_general.injectCSS)
    * [.pause()](#module_general.pause)
    * [.debug()](#module_general.debug)

<a name="module_general.init"></a>

### general.init()
The first step of a spec which ought to be overridden with an init() in your own custom actions module.

**Kind**: static method of <code>[general](#module_general)</code>  
<a name="module_general.goto"></a>

### general.goto(url)
Go to a given url.
If the url is relative, protractor will append that url to the baseUrl that was declared in your yanatra file
or in your command line.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the relative or absolute url to go to. |

**Example**  
```js
{
     "goto": "www.google.com"
}
```
<a name="module_general.get"></a>

### general.get()
Calls the goto action.

**Kind**: static method of <code>[general](#module_general)</code>  
<a name="module_general.scrollTo"></a>

### general.scrollTo(scroll)
Scroll the page using the window's scroll bars.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| scroll | <code>number</code> | 'Y' position on the page to scroll to. |

**Example**  
```js
// scroll down
{
     "scrollTo": 500
}
```
<a name="module_general.ignoreSync"></a>

### general.ignoreSync()
Disable angularJS synchronization for non-angular pages.
Will break certain actions that use angular specific syntax

**Kind**: static method of <code>[general](#module_general)</code>  
**Example**  
```js
[
   "ignoreSync",
   {
      "goto": "http://www.google.com"
   }
]
```
<a name="module_general.upload"></a>

### general.upload(filepath)
Upload an file on your system to your website.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| filepath | <code>string</code> | the relative (to the current subscript) or absolute path to the file. |

**Example**  
```js
{
     "upload": "../somepath/to/image/image.png"
}
```
<a name="module_general.selectOption"></a>

### general.selectOption(obj)
Choose an option in a select element.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | See [../lib.md#getElement](../lib.md#getElement) |
| [obj.text] | <code>object</code> | if 'obj.css' and 'obj.text' is present, the option will be located using by.cssContainingText. |
| obj.value | <code>object</code> | if 'obj.text' or 'obj.css' is not present, the element will be located using a child option with a matching value |

<a name="module_general.click"></a>

### general.click(obj)
Click on an element. Will wait for the element to become active and then try repeatedly to click on it.
By default, if an element is unclickable, yanatra will try again 3 more times (i.e., "retry": 3)

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| obj | <code>object</code> |  | [getElement](getElement) |
| [obj.force] | <code>boolean</code> |  | if the element should be clicked using document.querySelectorAll instead of selenium. |
| [args.skip] | <code>boolean</code> |  | if true, skip if the button could not be clicked after all (or none) retries have been exhausted. |
| [args.retry] | <code>boolean</code> | <code>3</code> | if true and if the button could not be clicked, wait and retry clicking the button |

**Example**  
```js
// click on the the element that matches the selector "button.some-class"
{
  "click": "button.some-class"
}
```
**Example**  
```js
//click on the element with the id "buttonThatMayNotBeHere"
//skip if that element is not present, visible, or clickable.
{
  "click": "#buttonThatMayNotBeHere",
  "skip": true
}
```
**Example**  
```js
// click on the element with the id "buttonMayTakeAWhile"
// if the element is unclickable, try again ten more times.
// skip if all attempts to click on it failed
{
  "click": {
     "attr": {
         "ng-click": "view.triggerEvent()"
     }
  },
  "retry": 10,
  "skip": true
}
```
<a name="module_general.submit"></a>

### general.submit()
Shorthand for clicking a page submit button.

**Kind**: static method of <code>[general](#module_general)</code>  
<a name="module_general.type"></a>

### general.type(obj)
Type keys into an element, normally an input field or text area.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | See [getElement](getElement) |
| obj.keys | <code>string</code> | The string of keys to send into the element |
| [obj.clear] | <code>boolean</code> | if true, the input field should be cleared of any characters before sending the keys. |
| [args.skip] | <code>boolean</code> | if true, skip if the element is not visible and ready after the normal timeout. |
| [args.retry] | <code>boolean</code> | if true and if the button could not be clicked, wait and retry clicking the button |

**Example**  
```js
// type the phrase "The wizard huffed and puffed and then exploded" in the element with the id "someInputElement"
{
     "type": {
         "css": "#someInputElement",
         "keys": "The wizard huffed and puffed and then exploded"
     }
}
```
**Example**  
```js
// try to type the phrase "andy is a great PM" into the first text area.
// skip if the textarea is unable to accept text input.
{
     "type": {
         "css": "textarea",
         "keys": "andy is a great PM"
     },
     "skip": true
}
```
**Example**  
```js
// try to type the string "1234567890" into the element with the ng-model "view.form.id"
// if the element is unable to accept input, retry 10 times before failing the spec.
{
     "type": {
         "model": "view.form.id",
         "keys": "1234567890"
     },
     "retry": 10
}
```
<a name="module_general.sleep"></a>

### general.sleep(time)
Do nothing for a certain period of time.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>number</code> | the length of time in milliseconds to do nothing for. |

<a name="module_general.waitForElement"></a>

### general.waitForElement(el)
Wait for an element to be visible and present on the page.

This action is automatically ran for click, type and other element interactions.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>string</code> &#124; <code>object</code> | {@link getElement } |

**Example**  
```js
{
     "waitForElement": "#anElement"
}
```
<a name="module_general.run"></a>

### general.run(script)
Run a subscript relative to the currently executing script's directory.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| script | <code>string</code> &#124; <code>object</code> | the path to the script to be run, or an object with special configuration |
| script.script | <code>string</code> | the path to the script to be run. |
| script.context | <code>object</code> | a key/value object of substitutions to be used for the subscript and its children. |
| script.skip_on_check_fail | <code>boolean</code> |  |
| script.retry | <code>int</code> |  |

<a name="module_general.screenshot"></a>

### general.screenshot([name])
Take a screenshot of the page as it appears in the browser window.
Will only be stored if a reportDir is defined for the running specs.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | a name for the screenshot, e.g. "cow" which will then be saved as "cow.png". if none is provided, the default is the current screenshotNumber. |

<a name="module_general.skip"></a>

### general.skip()
Do nothing and return a promise to move onto the next action.

**Kind**: static method of <code>[general](#module_general)</code>  
<a name="module_general.execute"></a>

### general.execute(script)
Execute custom javascript directly onto the page.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| script | <code>string</code> | the raw JS string to be executed, e.g. "alert('hi');" |

<a name="module_general.remember"></a>

### general.remember(obj)
Store the value of a variable, angular expression or otherwise for later use
in the current spec's runtime. This key and its value will only be availabe to the current spec, not
other specs or their subscripts, and will not be stored after the spec has completed.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | See [getValue](getValue) |
| obj.@ | <code>string</code> |  |

<a name="module_general.log"></a>

### general.log(variable)
Print the value of a variable, angular expression or otherwise in the console.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param | Type | Description |
| --- | --- | --- |
| variable | <code>object</code> | see getValue [../lib.md#getValue](../lib.md#getValue) |

**Example**  
```js
// log a variable that was stored with the "remember" action
{
     "log": "@rememberedVar@"
}
```
**Example**  
```js
// log a variable in your context
{
     "log": "#contextVar#"
}
```
**Example**  
```js
// execute a script on the page and print out its value
{
     "log": {
         "var": "window.getCurrentUser()"
     }
}
```
<a name="module_general.injectCSS"></a>

### general.injectCSS(css)
Inject a CSS string like "body { background: red }" onto the page  to change styling.

**Kind**: static method of <code>[general](#module_general)</code>  

| Param |
| --- |
| css | 

**Example**  
```js
{
     "injectCSS": "body { background: red; }"
}

TODO: recognize when the css string passed in starts with "../" or a "/" or a "/" and use its file contents as the string to inject.
```
<a name="module_general.pause"></a>

### general.pause()
Pauses the protractor, enables the protractor debugger in terminal, and usage of the developer toolbar in your browser.

**Kind**: static method of <code>[general](#module_general)</code>  
<a name="module_general.debug"></a>

### general.debug()
Calls the pause action.

**Kind**: static method of <code>[general](#module_general)</code>  
<a name="combineExports"></a>

## combineExports(otherModules) ⇒
Iterate over each module and copy their actions into the top-level actions object.

Note that an action with the same name/key as a previous module will override that module's action when merging in.

**Kind**: global function  
**Returns**: object  

| Param |
| --- |
| otherModules | 

