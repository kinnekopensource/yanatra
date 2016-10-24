# yanatra

Run E2E tests with JSON.

Built off of Protractor and Selenium.

Short for *yanatramanav*, the hindi word for robot.

## Overview

Instead of tests like code:
```js

browser.get("http://reddit.com/r/all");
browser.driver.wait(function() {
    return browser.driver.getCurrentUrl().then(function( url ) { // Always must return true
        return true;
    });
}).then(function() {
    return $("a[href=\"https://www.reddit.com/r/random/").waitReady().click();
});
```

Write tests like scripts:
```js
{
    {
      "goto": "https://www.reddit.com/r/all"
    },
    {
      "click": "a[href=\"https://www.reddit.com/r/random/]"
    }
}
```

yanatra runs "scripts": a linear sequence of actions.
The kind of actions a Product Manager or a QA person would write down in excel spreadsheet
 and perform manually.

yanatra scripts standardize these informal tests in two important ways.

1. __Readability__
A script is JSON array of objects. First attribute defines the action and the argument to
be passed into into that action.
Arguments can be strings, numbers, objects, depending on what the action accepts. [1]
	```js
	{
	   "sequence": [
	      {
		 "click": "#someButtonId"
	      },
	      {
		 "type": {
		    "keys": "one of the best.",
		    "css": "#allen"
		 }
	      }
	   ]
	}
	```

2. __Simplicity__ Normal E2E tests are fully-expressive, and offer complex control flow.
yanatra, on the other hand, limits the kinds of browser actions that can be be performed and how they are performed.
For the most part your tests will do one action after another, after another, and fail if an action cannot be performed.

yanatra scripts compile into normal JS Protractor tests, which automatically includes workaround some of Selenium's edge cases.' [2]

[1] yanatra aims to reduce barrier-to-entry for test creation and maintenance.

[2] Crashing if an element is not immediately clickable, for example.
 

### Install

Install the latest Oracle Java JRE, if on Mac, or the latest OpenJDK, if on Linux.

Mac OS X users should use brew, e.g.:
```sh
$ brew update
$ brew cask install java

```

Once you have the latest JRE, install yanatra globally:

```sh
$ sudo npm install -g yanatra
```

Finally, get the latest Selenium jars and Chrome drivers:

```
$ yanatra update
```

You will now be able to use yanatra in any directory on your system.

### Running scripts

Enter `yanatra` into your console in any directory on your machine. By default, this command will list out all avaiable arguments, options and extensions if
a yanatra.js file is in the directory.

To run a specific json:
```sh
yanatra run relative/or/absolute/path/to/your/script.json
```

Or to run all valid json in a directory:
```sh
yanatra run relative/or/absolute/path/
```

If no yanatra file is specified, yanatra will use the command line arguments you pass in, followed by the default configuration.

By default, yanatra will ignore any dir that starts with an underscore (`_`) when seeking scripts to run.

At the conclusion of the test, the results of each script will be written to a corresponding reports directory,
and summarized in an index.html file.

### Writing scripts

A _script_ is a json test file.

A _spec_ is a script run directly by yanatra.

A _sequence_ is the steps inside of a script.

A _step_ is an action at a particular moment of the script.

You can copy any one of the scripts `example/` to start, or run `yanatra init` to start them all.

yanatra works best when scripting "flows", multiple user actions across multiple pages or entry points. 
Unit tests are much better for testing components and modules in isolation.

#### Actions

An _action_ is what the protractor does to the browser, like ```click```, ```type```, ```screenshot``` and more.

Each action can accept an object, a string, or a numeric value as an argument.
An object can support any kind of data, so you can think of non-object arguments as shorthand.

For example, the click action can be written simply as:
```js
{
   "click": "#jqueryCssSelector"
}
```

or explicitly as:
```js
{
   "click": {
      "css":  "#jqueryCssSelector"
    }
}
```

You can view all the loaded actions, including your custom ones, by entering this command in console:

```sh
yanatra debug actions
```

For more on actions and their specific syntax, check out the [actions api](docs/actions/general.md)

##### Repeating Actions

Sometimes, one action will be repeated several times, using different arguments, e.g, filling out a form.

To reduce repetition, yanatra offers an optional array syntax for any action.

So instead of:
```js
{
	"type": {
		"model": "ctrl.ngModel.data.title",
		"keys": "hello"
	}
},
{
  	"type": {
		"model": "ctrl.ngModel.data.total",
		"keys": "mr robinson"
	}
},
{
  	"type": {
		"model": "ctrl.ngModel.data.sub",
		"keys": "912.3"
	}
}
```

Try:
```js
{
	"type": [
       {
           "model": "ctrl.ngModel.data.title",
           "keys": "hello"
       },
       {
           "model": "ctrl.ngModel.data.total",
           "keys": "mr robinson"
       },
       {
           "model": "ctrl.ngModel.data.sub",
           "keys": "912.3"
       }
	]
}
```

__Note__: this means an action cannot accept an array as its argument.


#### Expectations

*This functionality is still in alpha*

_Expectations_ assert that certain variables, elements, and other things during your spec's runtime
match the values written in your test.

You can access all expectations with the "expect" action.

For example, to test that a certain variable equals 10:

```
"expect": {
    "equal": [
        10,
        { "var": "window.products" }
    ]
}
```

The format for expecting variables is either to use a string or a number for a constant,
or to use object that will be resolved into a value.

```
{"var": window.products} -> gets the value of window.products
{"model": view.model} -> gets the value of view.model in your angular.html
```

yanatra supports shorthands for more complex expectations, like if an element is visible, present, and more.

If the expectation fails to pass, the current spec will continue until its completion, and then terminate any other specs that have yet to run.
To run all specs disregarding expectation errors, add the ``--steamroll`` flag in the terminal.

#### Context

_Contexts_ are key-value mappings substituted into your yanatra scripts and subscripts at __compile time__.
To indicate that you want to substitute a value from the context into a string, add a `#` right before and after the key, like so:

```js
{
    "context": {
        "website": "http://allenhascheerfulresolve.com",
        "inputName": "a field_to_be_submitted",
        "inputValue": 10
    },
    "sequence": [
        {
            "goto": "#website#"
        },
        {
            "type": {

                "name": "#buttonName#",
                "keys": "#inputValue#"
            }
        },
        "submit",
        {
            "goto": "#website#/a/path/that/will/be/added/onto/thesubstitionstring"
        }
    ]
}

```

Note that a context substitution will not change while your tests are running, unless a custom action modifies `runtime.context`


#### Remembered variables

Remembered variables are key-value mappings substituted into your yanatra scripts at __run time__.

This means that you can do things like remembering the values on pages, and using them to change the arguments of future actions:

```js
{
    "remember": {
        "var": "window.user_id",
        "@": "yanatraUserId"
    }
},
{
    "goto": "/profile/@yanatraUserId@/"
}

```

In this example, if the `user_id` on the page was 123456, the next action would go to the url `/profile/123456/`

To distinguish remembered variables from context variables in strings, you must place `@` before and after your key in the string instead of `#`.


#### Subscripts

A _subscript_ is a script run inside of specs using the ```run``` command. It should __not__ be run as a spec, i.e., by itself.

Subscripts are useful when you find that your spec files are each getting very, very large, or many of its steps are being repeated several times.


You can go from this structure:
```
script_dir
|-- script.json
```
```js
//script.json
{
      "click": "a[href='login']"
},
{
      "type": {
         "css": "input[name=username]",
         "text": "NewUser1"
      }
}
```

to this:
```
script_dir
|-- _subscript_dirname_here
|    |-- go_to_login_and_type_something.json
|-- script.json
```
```js
// script.json
{
      "run": "_subscript_dirname_here/go_to_login_and_type_something.json"
}

//_subscript_dirname_here/go_to_login_and_type_something.json
{
      "click": "a[href='login']"
},
{
      "type": {
         "css": "input[name=username]",
         "text": "NewUser1"
      }
}
```


__Note__  To clearly indicate a subscript is not a spec, place the subscript in a directory whose name starts with an underscore (`_`).

##### Run Options

You can also specify three options to the run command to customize its behavior:

* `skip_on_check_fail` - if `true`, yanatra will immediately stop executing the current subscript or any of its subscript if a single one of its `check` actions fail.
* `retry` - similar to `skip_on_check_fail`, except yanatra will retry the subscript until either all of its checks passes, or it reaches the number of retries (the value of the `retry` option).
* `context` - a custom context for the given subscript, which will override both the current context and the subscript's context.

You can use these options by using an object instead of a string for the run action.

```js
      "run": {
        "script": "_subscript_dirname_here/go_to_login_and_type_something.json",
        "retry": 10
      }
```

__Note__: `retry` includes `skip_on_check_fail` by default, so you don't need to have both to do retries.

##### Checks

A "check" is an assertion that uses the same syntax as the "expect" action.
The difference is that while an expectation will be written in the report, a check will only be logged as a runtime activity.

This means that if a check fails, the spec as a whole will not fail.

Checks are most useful while using the `retry` or `skip_on_check_fail` option, since failing those check commands
will trigger the `retry`/`skip_on_check_fail` check.

You can leverage checks to do simple conditional logic:
run this subscript if a check condition is true, or else skip the subscript. Or in the case of retries: repeat a subscript `X` number of times until all checks have passed, or terminate the spec.

### Extending yanatra

yanatra files are nodejs modules that alter and extend yanatra's default behavior.

For example, to set `"./scripts/regression/"` as the default directory for running scripts,
and `"../yanatra_reports"` as the default reports directory in `~/my_scratch_folder`, create
`~/my_scratch_folder/yanatra.js` with the contents:

```js
module.exports = {
   suites: "./scripts/regression/",
   reports: "../yanatra_reports"
}
```

You and others who have access to this dir will now get those two options automatically when issuing
 ```$ yanatra run```

To get started, go to an empty dir of your choosing and enter in console:
 ```sh
 yanatra init
 ```

This will copy a boilerplate yanatra config, actions, scripts and reports directory
into the current working directory.

You can specify a custom template to copy in `example/` by issuing

```sh
yanatra init [template_name_directory_here]
```

#### Custom Actions

Your scripts will eventually require specific actions that yanatra does not provide out of the box.
To add your own actions, specify the relative or absolute path to an actions module in your yanatra.js module:

```js
module.exports = {
   suites: "./scripts/regression/",
   reports: "../yanatra_reports",
   actions: "./actions.js"
}
```

The object that is returned by your custom actions module will be merged with yanatra's base actions.

"Merged" means any one of your actions has the same name as a base yanatra action will override the original.

For example, the ```init``` action is the first step of every spec and does nothing by default.

If you were to override it with action named ```init``` in your custom actions module, any spec ran using that yanatra file will now start your test with the code of your custom init.

If we wanted every spec to (re)start at the root of our website:

```js


    module.exports = {
        init() {
            return browser.get("/")
        }
    }
```

Custom, new actions can be declared as additional key/values to the json object returned by
your actions module. The `actions` variable supplied to the module gives you access to
default actions in your module, as long as they don't get overridden by your custom action.

```js
var actions = yanatra.actions;
module.exports = {
        init() {
            return browser.get("/")
        },
        submit() {
            return yanatra.actions.click("button[type=submit");
        }
    }
```

##### the `yanatra` object

All the JS that is called, executed or referred to be yanatra during runtime will have access to a global variable
called `yanatra`

`yanatra` contains five top-level properties:

* env - the configuration that yanatra starts each spec with.
* rem - the variables that have been remembered for the given spec.
* util - helper and utility functions to simpfy building actions.
* actions - the actions module that has been merged with your custom action module.
* baseActions - the original actions module that comes with yanatra.

###### Environment

An _environment_ is a json object that includes:

* args - arguments specified in the command line
* config - settings in your yanatra file

Every environment for your current test run is available under the `yanatra` global variable, as `yanatra.env`

```js
logEnvironment( arg) {
    return yanatra.actions.log(yanatra.env);
}
```

You can attach additional objects, strings, numbers, and functions to `yanatra.env`, although
 you should do so using your own namespace on the global `yanatra` object.

```js

init() {
    yanatra.mynamespace = {
        loggedEnvCount: 0
    };
},
logIncrement() {
    console.log(
        "envCount", 
        yanatra.mynamespace.loggedEnvCount++
    );
}
// will print out "envCount 0" on the first time
// and then "envCount 1" on the second time, and so forth.
```

All of your modifications to the global yanatra object will persist only across subscripts, and not specs; this means that if you run a test in parallel, you won't be able to share runtime data between the processes.

##### Runtime

Runtime refers to yanatra's current state by the time of the step.
It is supplied as the second argument of every action function.

For example, you can access  all the context variables that are currently available for the current action
with `runtime.context`. Note that changing the context here will only affect the script and its children, not the parent scripts.

```js
logContext( arg, runtime) {
    return yanatra.actions.log(runtime.context);
}
```

Changing context can be helpful if you want to set a context/substitution programmatically at the start of the test.

```js
init( args, runtime ) {
  runtime.context.randomUserName = runtime.context.time + "@gmail.com"
  return yanatra.actions.init();
}
```

And later:

```js
{
  "log": "#randomUserName#"
}
```

which will output the UNIX timestamp for when the test started, with the `@gmail.com` at its end.


#### Rem

Rem, `yanatra.rem`, is the object for all the key-values you stored with the `remember` action. Unlike context which is overridden on a tree/lexical level at a compile time, Rem should only change during runtime.

#### Custom protractor config

Currently, yanatra does not properly support custom protractor configs.
While the option is available in the terminal for the daring, using it will break many if not all of yanatra's behavior.


### Custom Arguments

Thanks to yargs, you can add custom options to your yanantra command using your `yanatra.js` file. Just add an `options` object:

```js
options: {
        allowLogin: {
            demand: false,
            describe: "email/username for user",
            type: 'boolean'
        }
    }
```

You will then be able to issue a command like `yanatra run --allowLogin` and see it as a possible option when the yanatra help prompt is shown for the directory your yanatra file is in.

In conjunction with the environment variable in your test, yanatra args can alter action behavior like so:

```js
login( arg ) {
    // did the test runner allow a login? (e.g. yanatra run --allowLogin)
    if (!yanatra.env.args.allowLogin) {
        return;
    }
    // looks like it did, proceed with login
    return someLoginFunction();
}

```

For more on the exact syntax of arguments you can add and leverage, please consult https://github.com/yargs/yargs.

### Chrome Extension

Optional, very alpha, fork of daylight (https://github.com/segmentio/daydream).

Yanatra-Chrome records your browser actions as yanatra actions.

This will likely be placed into its own repository since there is no shared code between it and yanatra Node.

## Project

### Known Bugs

* Missing unit tests for core yanatra functionality.
* Only Chrome is supported.
* Custom Protractor files are not easily integrated with yanatra.
* Certain actions will only work preoperly on AngularJS pages.
* Subscripts run with the `retry` or `skip_all_on_check_fail` break if they also have run statements with `retry` or `skip_all_on_check_fail`.

### FAQ

*Who should use this?*

The citizen developer who knows JSON, some CSS/HTML, and maybe a little JS.
Or an engineer who wishes to do E2E testing a bit faster.

*Why not just unit tests?*

Test each part of the software, and then test the software as a whole.

*How is this used at Kinnek?*

We extend yanatra the exact same way as any other user would:
a _plethora_ of custom actions and pretty complex flows broken up into a bunch of little subscripts

*Is there a roadmap?*

New features, functionality, and customization will be stated in the TODO. An actual roadmap will be created depending on the popularity of yanatra.

I recommend posting a Github issue for any particular request you may have or bug you may encounter. Thanks!

### Acknowledgements


#### People

Kinnek, for providing the development time to pursue the concept of script-driven testing.

#### Libraries

A small subset of yanatra's node dependencies that were particularly helpful.

* gulp-protractor
* jasmine-spec-reporter
* jasmine2-custom-message
* protractor
* protractor-fail-fast
* protractor-jasmine2-screenshot-reporter
* yargs

### TODO

1. Standardizing on syntax of expectations and element/value resolving.

2. Unit and functional tests for the yanatra compiler

3. Documentation. Both the code commments and the markdown files: the Docs folder is autogenerated from jsdoc and right now the output is not as pretty as it should be.
