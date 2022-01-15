<template>
  <b-container class="mt-5">
    <b-row>
      <b-col cols="12">
        <h4 class="mb-3">
          <i class="fas fa-mountain"></i>
          Serveurs
          <b-button variant="outline-primary" class="float-right" @click="$refs.table.refresh()">
            <b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise>
          </b-button>
        </h4>
      </b-col>
      <b-col cols="12" class="mb-3">
        <b-button v-b-modal.modal-edit-realm variant="success">
          <i class="fas fa-plus"></i> Ajouter
        </b-button>
      </b-col>
      <b-col cols="12">
        <b-table striped bordered hover head-variant="light" :fields="fields" :items="realms" ref="table"
                 :per-page="perPage"
                 :sort-by.sync="sortBy"
                 :sort-desc.sync="sortDesc"
                 :current-page="currentPage" show-empty responsive="sm">

          <template v-slot:cell(name)="row">
            <router-link :to="{name: 'admin-realm-show', params: {id: row.item._id}}"
                         v-b-tooltip.hover :title="row.item.name">
              {{ row.item.name }}
            </router-link>
            <b-icon-check-circle variant="primary" v-show="row.item.default"></b-icon-check-circle>
          </template>

          <template v-slot:cell(bank.currentAmount)="row">
            {{ numberWithSpaces(row.item.bank.currentAmount) }}
          </template>

          <template v-slot:cell(bank.totalAmount)="row">
            {{ numberWithSpaces(row.item.bank.totalAmount) }}
          </template>

          <template v-slot:cell(actions)="row">
            <b-button size="sm" variant="primary" class="ml-1 mr-1 text-white" v-b-tooltip.hover
                      title="Modifier la balance"
                      v-b-modal.modal-update-balance-realm @click="updateBalance(row.item)">
              <b-icon-cash></b-icon-cash>
            </b-button>
            <b-button size="sm" variant="warning" class="ml-1 mr-1 text-white" v-b-tooltip.hover
                      title="Modifier le serveur"
                      v-b-modal.modal-edit-realm @click="editRealm(row.item)">
              <b-icon-pencil-square></b-icon-pencil-square>
            </b-button>
            <b-button size="sm" variant="danger" class="ml-1 mr-1" v-b-tooltip.hover title="Supprimer le serveur"
                      v-b-modal.modal-destroy-realm @click="realm = row.item">
              <b-icon-x-circle></b-icon-x-circle>
            </b-button>
          </template>

          <template v-slot:empty>
            <h6 class="text-center">Aucun Serveur trouvé !</h6>
          </template>
        </b-table>

        <b-pagination v-model="currentPage" :total-rows="total" :per-page="perPage"></b-pagination>
      </b-col>
    </b-row>

    <b-modal id="modal-edit-realm" centered :title="isEditing ? 'Modifier le serveur' : 'Ajouter un serveur'"
             @hidden="resetForm"
             @ok.prevent="submit">
      <b-form @submit.prevent="submit">
        <b-form-group label="Nom du serveur">
          <b-form-input v-model="form.name" type="text" required
                        placeholder="Hyjal, Ysondre"></b-form-input>
          <b-form-invalid-feedback :state="getError(errors, 'name') === undefined">
            {{ getError(errors, 'name') ? getError(errors, 'name').msg : '' }}
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="Courant" v-if="isEditing">
          <b-form-input v-model="form.bank.currentAmount" type="number" required
                        placeholder="200000"></b-form-input>
          <b-form-invalid-feedback :state="getError(errors, 'bank.currentAmount') === undefined">
            {{ getError(errors, 'bank.currentAmount') ? getError(errors, 'bank.currentAmount').msg : '' }}
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="Total" v-if="isEditing">
          <b-form-input v-model="form.bank.totalAmount" type="number" required
                        placeholder="200000"></b-form-input>
          <b-form-invalid-feedback :state="getError(errors, 'bank.totalAmount') === undefined">
            {{ getError(errors, 'bank.totalAmount') ? getError(errors, 'bank.totalAmount').msg : '' }}
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-checkbox v-model="form.default" switch>
          Serveur par défaut
        </b-form-checkbox>
      </b-form>
    </b-modal>

    <b-modal id="modal-update-balance-realm" centered title="Modifier la balance"
             @hidden="resetForm"
             @ok.prevent="submitBalance">
      <b-form @submit.prevent="submitBalance">
        <b-form-group label="Courant" v-if="isUpdatingBalance">
          <b-form-input v-model="form.amount" type="number" required
                        placeholder="-1000, 1000"></b-form-input>
          <b-form-invalid-feedback :state="getError(errors, 'amount') === undefined">
            {{ getError(errors, 'amount') ? getError(errors, 'amount').msg : '' }}
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="Description" v-if="isUpdatingBalance">
          <b-form-input v-model="form.description" type="text" required
                        placeholder="Raid, Boost..."></b-form-input>
          <b-form-invalid-feedback :state="getError(errors, 'description') === undefined">
            {{ getError(errors, 'description') ? getError(errors, 'description').msg : '' }}
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal id="modal-destroy-realm" centered title="Supprimer un serveur"
             @hidden="resetForm"
             @ok.prevent="destroy" v-if="realm">
      Voulez-vous vraiment supprimer le serveur `{{ realm.name }}` ?
    </b-modal>
  </b-container>
</template>

<script>
  export default {
    data () {
      return {
        currentPage: 1,
        total: 0,
        perPage: 20,
        sortBy: 'name',
        sortDesc: false,
        realm: null,
        isEditing: false,
        isUpdatingBalance: false,
        errors: [],
        fields: [
          {key: 'name', label: 'Nom', sortable: true},
          {key: 'bank.currentAmount', label: 'Courant', sortable: true},
          {key: 'bank.totalAmount', label: 'Total', sortable: true},
          {key: 'actions', label: 'Actions', sortable: false}
        ],
        realms: this.realmsProvider,
        form: {
          name: '',
          default: false
        }
      }
    },
    methods: {
      destroy () {
        window.axios
          .delete(`/api/realms/${this.realm._id}`)
          .then(() => {
            this.$refs.table.refresh()
          })
          .finally(() => {
            this.$bvModal.hide('modal-destroy-realm')
          })
      },
      editRealm (realm) {
        this.isEditing = true
        this.realm = realm
        this.form = {
          name: realm.name,
          default: realm.default,
          bank: {
            currentAmount: realm.bank.currentAmount,
            totalAmount: realm.bank.totalAmount
          }
        }
      },
      updateBalance (realm) {
        this.isUpdatingBalance = true
        this.realm = realm
        this.form = {
          amount: null,
          description: null
        }
      },
      resetForm () {
        this.form = {
          name: '',
          default: false
        }
        this.realm = null
        this.isEditing = false
        this.isUpdatingBalance = false
      },
      submit () {
        this.errors = []
        let request

        if (this.isEditing) {
          request = window.axios.put(`/api/realms/${this.realm._id}`, this.form)
        } else {
          request = window.axios.post('/api/realms', this.form)
        }

        request
          .then(() => {
            this.$refs.table.refresh()
            this.$bvModal.hide('modal-edit-realm')
          })
          .catch(error => {
            if (error.response.status === 422) {
              this.errors = error.response.data.errors
            }
          })
      },
      submitBalance () {
        this.errors = []

        window.axios.post(`/api/realms/${this.realm._id}/updateBalance`, this.form)
          .then(() => {
            this.$refs.table.refresh()
            this.$bvModal.hide('modal-update-balance-realm')
          })
          .catch(error => {
            if (error.response.status === 422) {
              this.errors = error.response.data.errors
            }
          })
      },
      realmsProvider (ctx) {
        return window.axios
          .get('/api/realms/admin', {params: {page: ctx.currentPage}})
          .then(response => {
            const data = response.data

            this.currentPage = data.page
            this.total = data.totalDocs
            this.perPage = data.limit

            return data.data
          })
          .catch(error => {
            console.error(error.response.data.message)
            return []
          })
      }
    }
  }
</script>
