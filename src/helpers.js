export default {
  array_get (array, key, defaultValue = null) {
    key.split('.').forEach(k => {
      let regex = new RegExp('^(.+)\\[(\\d+)\\]$')
      let match = k.match(regex)

      if (match) {
        array = array[match[1]]
        k = match[2]
      }

      if (array[k] === undefined || array[k] === null) {
        array = defaultValue
        return
      }
      array = array[k]
    })
    return array
  },
  getError (errors, param) {
    return errors.find(error => error.param === param)
  },
  fill (form, data, exceptions = [], create = true) {
    if (data === undefined || data === null) {
      return form
    }

    if (create) {
      form = {...form}
    }

    for (const key of Object.keys(form)) {
      if (exceptions.indexOf(key) !== -1) {
        continue
      }

      if (Array.isArray(form[key])) {
        form[key] = [...data[key]]
      } else if (typeof form[key] === 'object') {
        form[key] = this.fill(form[key], data[key])
      } else {
        form[key] = this.array_get(data, key, form[key])
      }
    }

    return form
  },
  formatDate (date, format = null) {
    if (!format) {
      format = 'DD/MM/YYYY'
    }

    return window.moment(date).format(format)
  },
  numberWithSpaces: x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  },

}