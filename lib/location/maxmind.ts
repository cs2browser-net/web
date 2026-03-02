import { readFileSync } from "fs"
import { CityResponse, Reader } from 'maxmind'

// @ts-expect-error yes here
if (!global._mmdbv4) {
    const buffer = readFileSync("lib/location/dbip-city-ipv4.mmdb")

    // @ts-expect-error yes here
    global._mmdbv4 = new Reader<CityResponse>(buffer)
}

// @ts-expect-error yes here
if (!global._mmdbv6) {
    const buffer = readFileSync("lib/location/dbip-city-ipv6.mmdb")

    // @ts-expect-error yes here
    global._mmdbv6 = new Reader<CityResponse>(buffer)
}

// @ts-expect-error yes here
const mmdbv4: Reader<CityResponse> = global._mmdbv4
// @ts-expect-error yes here
const mmdbv6: Reader<CityResponse> = global._mmdbv6

export { mmdbv4, mmdbv6 }