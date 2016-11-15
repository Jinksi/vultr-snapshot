const _filter = require('lodash/filter')
const _each = require('lodash/each')
const moment = require('moment')
const Vultr = require('vultr')

const VULTR_API_KEY = 'VULTR_API_KEY_HERE'
const cutoffTime = moment().subtract( 1 , 'month')

const vultrInstance = new Vultr(VULTR_API_KEY)

vultrInstance.snapshot.list().then(snapshots => {
  if(snapshots){
    const oldSnaps = _filter(snapshots, snap => {
      const myDate = moment(snap.date_created)
      return myDate.isBefore(cutoffTime)
    })
    if(oldSnaps.length){
      console.log('Found old snapshots to delete')
      _each(oldSnaps, snap => {
        console.log(`Deleting ${snap.SNAPSHOTID}`)
        vultrInstance.snapshot.destroy(snap.SNAPSHOTID)
      })
    } else {
      console.log('Nothing to delete')
    }
  }
}).catch(res => console.log(res.message))
