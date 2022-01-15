<template>
  <div class="autocomplete-container">
    <div class="autocomplete-container-content">
      <b-input type="text" v-model="searchInput" placeholder="Rechercher" @input="input"
               @click="open" @focus="open" @blur="close"
               @keydown="keydown" :style="{width: windowWidth < 992 ? 'auto': '250px'}" :state="hasResults"></b-input>
      <ul class="autocomplete" :class="{'autocomplete-opened': showAutocomplete}"
          v-show="showAutocomplete && choices.length" ref="autocomplete">
        <li class="autocomplete-item" v-for="(choice, k) in choices"
            :class="{'autocomplete-item-active': active === k}"
            @mousedown.prevent.stop="select(choice)" @mouseover="setActive(k)" :ref="`autocomplete-item-${k}`"
            :key="choice.value">
          {{ choice.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        active: 0,
        choices: [],
        showAutocomplete: false,
        timeout: null,
        searchInput: '',
        windowWidth: 0,
        hasResults: undefined
      }
    },
    mounted () {
      this.windowWidth = window.innerWidth

      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth
      })
    },
    methods: {
      close () {
        this.showAutocomplete = false
        document.removeEventListener('keyup', this.keyup)
      },
      down () {
        this.active = (this.active + 1) % this.choices.length
        const dropdown = this.$refs.autocomplete
        const element = this.getActiveElement()
        const elementRect = element.getBoundingClientRect()

        const offset = elementRect.top - dropdown.getBoundingClientRect().top
        if (this.active === 0) {
          dropdown.scrollTo({
            top: 0
          })
        } else if (offset >= dropdown.getBoundingClientRect().height) {
          dropdown.scrollBy({
            top: offset
          })
        }
      },
      enter () {
        this.select(this.choices[this.active])
      },
      getActiveElement () {
        const key = `autocomplete-item-${this.active}`
        return this.$refs[key][0]
      },
      input () {
        this.choices = []

        if (this.timeout) {
          clearTimeout(this.timeout)
        }

        if (this.searchInput.length >= 2) {
          this.timeout = setTimeout(this.search, 300)
        }
      },
      keydown (event) {
        switch (event.which) {
          case 38:
            this.stopAndPreventDefault(event)
            this.up()
            break
          case 9:
          case 40:
            this.stopAndPreventDefault(event)
            this.down()
            break
          case 13:
            this.stopAndPreventDefault(event)
            this.enter()
            break
        }
      },
      keyup (event) {
        if (event.which === 27) {
          this.stopAndPreventDefault(event)
          this.close()
        }
      },
      open () {
        this.showAutocomplete = true
        this.setActive(0)
        document.addEventListener('keyup', this.keyup)
      },
      search () {
        this.hasResults = undefined

        window.axios
          .post('/api/users/autocomplete', {search: this.searchInput})
          .then(response => {
            this.choices = response.data.data.map(u => {
              return {value: u._id, label: u.nickname}
            })
            this.timeout = null

            if (this.choices.length) {
              this.showAutocomplete = true
            } else {
              this.hasResults = false
            }
          })
      },
      select (choice) {
        this.close()

        if (choice !== undefined) {
          this.searchInput = choice.label
          if (this.$route.name === 'user-show' && this.$route.params.id === choice.value) return

          this.$router.push({name: 'user-show', params: {id: choice.value}})
        }
      },
      setActive (k) {
        this.active = k
      },
      stopAndPreventDefault (event) {
        event.preventDefault()
        event.stopPropagation()
      },
      up () {
        this.active = (this.active - 1 + this.choices.length) % this.choices.length
        const dropdown = this.$refs.autocomplete
        const element = this.getActiveElement()
        const elementRect = element.getBoundingClientRect()

        const offset = elementRect.top - dropdown.getBoundingClientRect().top
        dropdown.scrollBy({
          top: offset
        })
      }
    }
  }
</script>
