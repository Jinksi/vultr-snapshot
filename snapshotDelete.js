#!/usr/bin/env node

const _filter = require('lodash/filter')
const _each = require('lodash/each')
const moment = require('moment')
const Vultr = require('vultr')
const parseArgs = require('minimist')(process.argv.slice(2))

const VULTR_API_KEY = parseArgs.key || parseArgs.k
const SUBID = parseArgs.subid || parseArgs.s
const DAYS = parseArgs.days || parseArgs.d

if(!VULTR_API_KEY) return console.log('Please provide a VULTR API KEY [ -k API_KEY ]')

const vultrInstance = new Vultr(VULTR_API_KEY)

const deleteSnapshots = () => {
  if(parseInt(DAYS, 10) > 28){

    const cutoffTime = moment().subtract( DAYS , 'day')

    vultrInstance.snapshot.list()
    .then(snapshots => {
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
          console.log(`No snapshots older than ${cutoffTime.fromNow(true)}`)
        }
      }
    })
    .catch(res => console.log(res.message))

  } else if(parseInt(DAYS, 10)) {
    console.log('Not deleting Snapshots – Age In Days must be at least 28')
  } else {
    console.log('Not deleting Snapshots – Age In Days not supplied [ -d AGE_IN_DAYS ]')
  }

}

const createSnapshot = () => {
  console.log('Creating Snapshot')

  vultrInstance.snapshot.create(SUBID, moment().toString())
  .then(res => {
    console.log(`Snapshot Created Successfully: ${res.SNAPSHOTID}`)
    deleteSnapshots()
  })
  .catch(res => {
    console.log(res.message)
    deleteSnapshots()
  })
}

const listServers = () => {
  console.log('Collecting Server List...\n')
  vultrInstance.server.list()
  .then(list => {
    _each(list, server => {
      console.log(`SUBID: ${server.SUBID} – OS: ${server.os} – Location: ${server.location} – Label: ${server.label}`)
    })
    console.log()
  })
  .catch(res => console.log(res.message))
}

if(!SUBID){
  console.log('Please provide an Instance ID [ -s SUBID ]')
  listServers()
} else {
  createSnapshot()
}
