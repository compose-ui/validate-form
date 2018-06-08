var toolbox = require( 'compose-toolbox' ),
    Event = toolbox.event,
    getLabel = require( './get-label' ),
    inputSelectors = require( './selector' ),
    watching = false

function inputInit( input ) {
  input.classList.toggle( 'empty', !input.value.trim().length )
  if ( input.type == 'radio' || input.type == 'checkbox' ) {
    input.dataset.initialValue = input.checked
  } else {
    input.dataset.initialValue = input.value
  }
}

function inputChange( input ) {
  // Allow calling from event handler
  var input = ( input.target || input )

  // If element is empty (or contains only whitespace)
  // Add empty class
  input.classList.toggle( 'empty', !input.value.trim().length )

  changeClasses( input )

  var form = toolbox.getClosest( input, 'form' )
  if ( form ) {
    Event.fire( form, 'change' )
  }
}

function changeClasses( input, recursive ) {
  var changed

  if ( input.type == 'radio' && !recursive ) {
    var form = toolbox.getClosest( input, 'form' )
    if ( form ) {
      return Array.prototype.forEach.call( form.querySelectorAll( `[name='${input.name}']` ), e => {
        changeClasses( e, true )
      })
    } } else if ( input.type == 'checkbox' || input.type == 'radio' ) { changed = String( input.checked ) != input.dataset.initialValue
  } else {
    changed = input.value != input.dataset.initialValue
  }

  input.classList.toggle( 'changed-value', changed )

  var label = getLabel( input )
  if ( label ) {
    label.classList.toggle( 'input-changed-value', label.querySelector( '.changed-value' ) || input.classList.contains( 'changed-value' ) )
  }
}


function watch () {
  if ( watching ) { return }
  // Initialize input state
  Event.change( function() {
    toolbox.each( document.querySelectorAll( inputSelectors ), inputInit )
  })

  // Set input state on input
  Event.on( document, 'input', inputSelectors, inputChange )

  // Form.reset() doesn't fire input events. This ensures those events are fired.
  Event.on( document, 'click', '[type=reset]', resetForm )

  watching = true
}


function resetForm(event) {
  var form = toolbox.getClosest(event.target, 'form')

  Event.delay( function() {
    toolbox.each(form.querySelectorAll('input.input-changed, select.input-changed, textarea.input-changed '), function( el ) {
      Event.fire( el, 'input' )
    })
  }, 100 )
}

module.exports = {
  watch: watch
}