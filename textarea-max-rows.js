function createElement(tagName, attributes) {
  const element = document.createElement(tagName)

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

function patchTextarea(element) {
  const attrClass = element.getAttribute('class')
  const attrStyle = element.getAttribute('style')
  const attrRows = element.getAttribute('rows') || 1
  const attrMaxRows = element.getAttribute('max-rows')

  const minRows = Number.parseInt(attrRows)
  const maxRows = Number.parseInt(attrMaxRows)

  const shadowElement = createElement('textarea', {
    class: attrClass,
    style: `box-sizing: border-box; ${attrStyle}`,
    rows: attrRows,
    'max-rows': attrMaxRows,
  })
  moveElementOffscreen(shadowElement)
  syncWidthFrom(shadowElement, element)
  insertAfter(shadowElement, element)

  element.addEventListener('input', function () {
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
  })

  element.dispatchEvent(new Event('input'))
}

window.addEventListener('load', () => {
  const textareas = document.querySelectorAll('textarea[max-rows]')
  Array.prototype.forEach.call(textareas, patchTextarea)
})
