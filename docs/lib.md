## Modules

<dl>
<dt><a href="#module_sequence">sequence</a> : <code>function</code></dt>
<dd><p>Compiles and runs all the steps in a yanatra&#39;s script sequence.</p>
</dd>
<dt><a href="#module_subscript">subscript</a> : <code>function</code></dt>
<dd><p>Compiles and runs a script inside of a yanatra script sequence.</p>
</dd>
<dt><a href="#module_substitute">substitute</a> : <code>function</code></dt>
<dd><p>Using the keys and values in the script&#39;s context object,  or in the yanatra.rem object,
replace all the arguments that match the key with its delimeters. @{key}@ for yanatra.rem, #{key}# for context.</p>
<p>TODO: determine if having a runtime substituion and a compile time substitution is useful or not.</p>
</dd>
<dt><a href="#module_Util">Util</a> : <code>object</code></dt>
<dd><p>Helper object for functions and variables that are shared between actions.</p>
</dd>
<dt><a href="#module_WaitReady">WaitReady</a> : <code>function</code></dt>
<dd><p>Current workaround until <a href="https://github.com/angular/protractor/issues/1102">https://github.com/angular/protractor/issues/1102</a></p>
</dd>
</dl>

<a name="module_sequence"></a>

## sequence : <code>function</code>
Compiles and runs all the steps in a yanatra's script sequence.

<a name="module_sequence..checkAction"></a>

### sequence~checkAction(key)
Check if an action with the passed in name exists

**Kind**: inner method of <code>[sequence](#module_sequence)</code>  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="module_subscript"></a>

## subscript : <code>function</code>
Compiles and runs a script inside of a yanatra script sequence.

<a name="module_substitute"></a>

## substitute : <code>function</code>
Using the keys and values in the script's context object,  or in the yanatra.rem object,
replace all the arguments that match the key with its delimeters. @{key}@ for yanatra.rem, #{key}# for context.

TODO: determine if having a runtime substituion and a compile time substitution is useful or not.


* [substitute](#module_substitute) : <code>function</code>
    * [.replace(value, index, arr, replace)](#module_substitute.replace) ⇒ <code>boolean</code>
    * [.replaceUsingContext(index, arr, context)](#module_substitute.replaceUsingContext)
    * [.replaceUsingRem(index, arr)](#module_substitute.replaceUsingRem)
    * [.recurse(index, arr, replaceUsing)](#module_substitute.recurse)
    * [.recurseOverContext(index, arr, context)](#module_substitute.recurseOverContext)
    * [.recurseOverRem(index, arr)](#module_substitute.recurseOverRem)

<a name="module_substitute.replace"></a>

### substitute.replace(value, index, arr, replace) ⇒ <code>boolean</code>
**Kind**: static method of <code>[substitute](#module_substitute)</code>  

| Param | Type |
| --- | --- |
| value | <code>number</code> &#124; <code>boolean</code> &#124; <code>string</code> | 
| index | <code>number</code> | 
| arr | <code>array</code> | 
| replace | <code>string</code> | 

<a name="module_substitute.replaceUsingContext"></a>

### substitute.replaceUsingContext(index, arr, context)
Context is substituted in on compile time

**Kind**: static method of <code>[substitute](#module_substitute)</code>  

| Param | Type |
| --- | --- |
| index | <code>int</code> | 
| arr | <code>array</code> | 
| context | <code>object</code> | 

<a name="module_substitute.replaceUsingRem"></a>

### substitute.replaceUsingRem(index, arr)
Rems are substituted in during runtime.

**Kind**: static method of <code>[substitute](#module_substitute)</code>  

| Param | Type |
| --- | --- |
| index | <code>int</code> | 
| arr | <code>array</code> | 

<a name="module_substitute.recurse"></a>

### substitute.recurse(index, arr, replaceUsing)
**Kind**: static method of <code>[substitute](#module_substitute)</code>  

| Param | Type |
| --- | --- |
| index | <code>int</code> | 
| arr | <code>array</code> | 
| replaceUsing | <code>function</code> | 

<a name="module_substitute.recurseOverContext"></a>

### substitute.recurseOverContext(index, arr, context)
**Kind**: static method of <code>[substitute](#module_substitute)</code>  

| Param | Type |
| --- | --- |
| index | <code>int</code> | 
| arr | <code>array</code> | 
| context | <code>object</code> | 

<a name="module_substitute.recurseOverRem"></a>

### substitute.recurseOverRem(index, arr)
**Kind**: static method of <code>[substitute](#module_substitute)</code>  

| Param | Type |
| --- | --- |
| index | <code>int</code> | 
| arr | <code>array</code> | 

<a name="module_Util"></a>

## Util : <code>object</code>
Helper object for functions and variables that are shared between actions.

<a name="module_Util.getElement"></a>

### Util.getElement(element) ⇒ <code>ElementFinder</code>
Get an element from the page using a string or an object.
This simplifies the protractor syntax and helps in cases where $() fails.

Filtering using multiple attributes is useful when the element in question
cannot be located using a unique ID, className etc.

**Kind**: static method of <code>[Util](#module_Util)</code>  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>object</code> &#124; <code>string</code> |  |
| [element.css] | <code>string</code> | a document.querySelectorAll-friendly selector |
| [element.value] | <code>string</code> | the value of the "value" attribute |
| [element.model] | <code>string</code> | the value of the "ng-model" attribute |
| [element.tagName] | <code>string</code> | the tag name of the element to find |
| [element.name] | <code>string</code> | the value of the "name" attribute |
| [element.attr] | <code>object</code> | the key is the name of the custom attribute  to match with, e.g. "ng-click". the value of the key is the value of the custom attribute, e.g. "view.toggleButton()" |
| [element.child] | <code>object</code> | out of all the matching element sets, look underneath each one for a child element that matches another [getElement](getElement) |

<a name="module_WaitReady"></a>

## WaitReady : <code>function</code>
Current workaround until https://github.com/angular/protractor/issues/1102

