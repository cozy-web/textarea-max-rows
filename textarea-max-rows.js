function createElement(tagName, attributes) {
  const element = document.createElement(tagName)

  for (const [key, value] of Object.entries(attributes)) {
    if (value) {
      element.setAttribute(key, value)
    }
  }

  return element
}

function shapeElement(element, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    if (value) {
      element.setAttribute(key, value)
    }
  }

  return element
}

function moveElementOffscreen(element) {
  const move = () => {
    element.style.position = 'absolute'
    element.style.left = `-${document.body.clientWidth * 2}px`
  }

  move()
  window.addEventListener('resize', move)

  return element
}

function syncWidthFrom(newElement, existingElement) {
  const resizeObserver = new ResizeObserver(([entry], _observer) => {
    const width = entry.target.offsetWidth
    newElement.style.width = `${width}px`
  })

  resizeObserver.observe(existingElement)
  return resizeObserver
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

function patchTextareaMaxRowsSupport(element, { shadowElement = null } = {}) {
  const attrClass = element.getAttribute('class')
  const attrStyle = element.getAttribute('style')
  const attrRows = element.getAttribute('rows') || 1
  const attrMaxRows = element.getAttribute('max-rows')

  const minRows = Number.parseInt(attrRows)
  const maxRows = Number.parseInt(attrMaxRows)

  const shouldInsertShadowElement = !shadowElement

  const attributes = {
    class: attrClass,
    style: `box-sizing: border-box !important; ${attrStyle}`,
    rows: attrRows,
    'max-rows': attrMaxRows,
  }

  if (shadowElement) {
    shadowElement = shapeElement(shadowElement, attributes)
  } else {
    shadowElement = createElement('textarea', attributes)
  }

  moveElementOffscreen(shadowElement)
  syncWidthFrom(shadowElement, element)
  if (shouldInsertShadowElement) {
    insertAfter(shadowElement, element)
  }

  function syncRows() {
    // copy the content from the real textarea
    shadowElement.value = element.value

    // get the height of content
    shadowElement.setAttribute('rows', 1)
    const contentHeight = shadowElement.scrollHeight

    // increase the number of rows until finding a proper number.
    for (let rows = minRows; rows <= maxRows; rows++) {
      shadowElement.setAttribute('rows', rows)

      if (shadowElement.clientHeight >= contentHeight) {
        break
      }
    }

    const oldRows = element.getAttribute('rows')
    const newRows = shadowElement.getAttribute('rows')
    element.setAttribute('rows', newRows)

    if (oldRows !== newRows) {
      const event = new CustomEvent('rows-change', {
        detail: { rows: Number.parseInt(newRows) },
      })
      element.dispatchEvent(event)
    }
  }

  element.addEventListener('input', () => {
    syncRows()
  })

  // override original getter and setter in order to call syncRows() when the value is set by JavaScript.
  const { get, set } = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
  Object.defineProperty(element, 'value', {
    get() {
      return get.call(this)
    },
    set(value) {
      set.call(this, value)
      syncRows()
    },
  })
}

export default patchTextareaMaxRowsSupport
