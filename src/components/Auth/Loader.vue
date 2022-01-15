<template>
  <b-container class="mt-5">
    <b-row>
      <b-col cols="12" align-h="center">
        <div class="text-center">
          <b-spinner variant="primary" style="width: 5rem; height: 5rem;" label="Large Spinner"></b-spinner>
          <h4 class="text-primary m-3">Chargement...</h4>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  export default {
    mounted () {
      const code = this.$route.query.code

      if (!code) this.$router.push({name: 'home'})

      window.axios.get('/auth/callback', {params: {code}})
        .then(response => {
          const token = response.data.jwtToken

          this.loadUserFromToken(token)
        })
        .catch(error => {
          console.log(error.response.data.message)
        })
        .finally(() => {
          this.$router.push({name: 'home'})
        })
    }
  }
</script>
