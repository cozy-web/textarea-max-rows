# textarea-max-rows

> Expand a `<textarea></textarea>` to fit its content, between a minimum (`rows` attribute) and maximum (`max-rows` attribute) number of rows.

An improved version of [`max-rows` attribute support of <textarea></textarea>](https://gist.github.com/hubgit/e08998bf2dfdec556b2726d13035cd2c):

- use vanilla JavaScript.
- use more robust caculation of `rows` attribute.
- add rows changing event - `rows-change`
- handle edge conditions, such as resizing, unmatched box-sizing, etc.

## Dependencies

- `ResizeObserver` API

> Use a polyfill if your environments don't support this feature. For example:
>
> - https://www.npmjs.com/package/@juggle/resize-observer

## Create an NPM package?

Because this isn't a very universal solution, I am not going to do that.

## License

MIT
