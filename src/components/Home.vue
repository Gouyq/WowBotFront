<template>
  <b-container class="mt-5">
    <b-row align-h="center" v-if="!isAuthenticated">
      <b-col fluid="sm">
        <b-card>
          <div class="text-center">
            <b-button variant="info" size="lg" :href="authURL">
              <b-icon-arrow-right-square></b-icon-arrow-right-square>
              Se connecter avec Discord
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-row align-h="center" v-if="isGranted('ROLE_ADVERTISER')">
      <b-col cols="12" lg="8">
        <b-card header="Publish a boost">
          <b-form @submit.prevent="submit">
            <b-form-group label="Server">
              <b-form-select v-model="form.realm" :options="realmOptions" required></b-form-select>
            </b-form-group>
            <b-form-group label="Number of keys">
              <b-form-radio-group v-model="form.keysCount" name="radio-sub-component" @change="updateKeys">
                <b-form-radio v-for="i in 4" :value="i" :key="i">{{ i }}</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
            <b-form-group v-for="(key, i) in form.keys" :key="i" :label="`Donjon ${i + 1}`">
              <b-form-select v-model="form.keys[i].level" :options="levelOptions"
                             style="width: 70px; margin-right: 10px;"></b-form-select>
              <b-form-select v-model="form.keys[i].instance" :options="dungeonOptions"
                             style="width: calc(100% - 80px);"></b-form-select>
            </b-form-group>
            <b-form-group label="Armor Stack">
              <b-form-select v-model="form.stack" :options="stackOptions"></b-form-select>
            </b-form-group>
            <b-form-group label="Whisper character">
              <b-form-input v-model="form.whisper" type="text" required
                            placeholder="CharacterName-Server"></b-form-input>
            </b-form-group>
            <b-form-group label="Amount">
              <b-form-input v-model="form.total" type="number" required
                            placeholder="250000"></b-form-input>
            </b-form-group>
            <b-form-group label="Description">
              <b-form-textarea v-model="form.description" placeholder="More information"
                               rows="3"></b-form-textarea>
            </b-form-group>

            <div class="mt-3 mb-3">
              <b-icon-caret-down-fill v-if="showSpecificPlayers"></b-icon-caret-down-fill>
              <b-icon-caret-right-fill v-if="!showSpecificPlayers"></b-icon-caret-right-fill>
              <a href="#" class="text-dark" @click.prevent="showSpecificPlayers = !showSpecificPlayers"><strong>Pick specific players</strong></a>
            </div>

            <div class="mb-3" v-show="showSpecificPlayers">
              <player-autocomplete label="Tank" v-model="form.specificPlayers.tank"></player-autocomplete>
              <player-autocomplete label="Healer" v-model="form.specificPlayers.healer"></player-autocomplete>
              <player-autocomplete label="DPS" v-model="form.specificPlayers.dps1"></player-autocomplete>
              <player-autocomplete label="DPS" v-model="form.specificPlayers.dps2"></player-autocomplete>
              <player-autocomplete label="Keyholder" v-model="form.specificPlayers.key" v-show="isSpecificKey"></player-autocomplete>
            </div>

            <div class="text-center">
              <b-button type="submit" variant="success" :disabled="isSending">Publish</b-button>
            </div>
          </b-form>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import {mapActions, mapGetters} from 'vuex'
  import PlayerAutocomplete from './Boost/PlayerAutocomplete'

  export default {
    components: {PlayerAutocomplete},
    computed: {
      ...mapGetters('realm', [
        'realms'
      ]),
      isSpecificKey () {
        let requestedKeys = this.form.keys.map(key => {
          return key.instance
        })
        requestedKeys = [...new Set(requestedKeys)]

        return !requestedKeys.includes('ANY')
      },
      realmOptions () {
        return [
          {value: null, text: 'Select a server'},
          ...this.realms.map(realm => {
            return {
              value: realm._id,
              text: realm.name
            }
          })
        ]
      }
    },
    data () {
      return {
        authURL: '',
        levelOptions: [],
        isSending: false,
        dungeonOptions: [
          {value: 'ANY', text: 'Unspecified'},
          {value: 'DOS', text: 'De Other Side'},
          {value: 'HOA', text: 'Halls of Atonement'},
          {value: 'MOTS', text: 'Mists of Tirna Scithe'},
          {value: 'PL', text: 'Plaguefall'},
          {value: 'SD', text: 'Sanguine Depths'},
          {value: 'SOA', text: 'Spires of Ascension'},
          {value: 'NW', text: 'The Necrotic Wake'},
          {value: 'TOP', text: 'Theater of Pain'},
        ],
        stackOptions: [
          {value: 'none', text: 'No armor stack'},
          {value: 'leather', text: 'Leather'},
          {value: 'mail', text: 'Mail'},
          {value: 'plate', text: 'Plate'},
          {value: 'cloth', text: 'Cloth'},
        ],
        form: {
          keysCount: 1,
          keys: [],
          stack: 'none',
          total: 0,
          description: '',
          whisper: '',
          realm: null,
          specificPlayers: {
            tank: null,
            healer: null,
            dps1: null,
            dps2: null,
            key: null
          }
        },
        showSpecificPlayers: false
      }
    },
    watch: {
      'form.total' () {
        this.form.total = parseInt(this.form.total)
      }
    },
    mounted () {
      this.authURL = `${process.env.VUE_APP_API_BASE_URL}/auth`

      for (let i = 10; i < 25; i++) {
        this.levelOptions.push({value: i, text: i})
      }

      this.updateKeys(1)

      if (this.user) {
        this.getRealms()
      }
    },
    methods: {
      ...mapActions('realm', [
        'getRealms'
      ]),
      submit () {
        this.isSending = true

        window.axios.post('/api/boosts', this.form)
          .then(() => {
            this.$toasted.show('Boost Publié', {icon: 'fa-check'})

            this.resetForm()
          })
          .catch(console.error)
          .finally(() => {
            this.isSending = false
          })
      },
      resetForm () {
        this.form = {
          keysCount: 1,
          keys: [
            {
              level: 15,
              instance: 'ANY'
            }
          ],
          stack: 'none',
          total: 0,
          description: '',
          whisper: '',
          realm: null,
          specificPlayers: {
            tank: null,
            healer: null,
            dps1: null,
            dps2: null,
            key: null
          }
        }
      },
      updateKeys (value) {
        this.form.keysCount = value

        const template = {
          level: 15,
          instance: 'ANY'
        }

        if (this.form.keys.length >= this.form.keysCount) {
          this.form.keys = this.form.keys.slice(0, this.form.keysCount)
        } else {
          const diff = this.form.keysCount - this.form.keys.length

          for (let i = 0; i < diff; i++) {
            this.form.keys.push(template)
          }
        }
      }
    }
  }
</script>
