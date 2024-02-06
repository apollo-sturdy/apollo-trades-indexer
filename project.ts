import {
  CosmosDatasourceKind,
  CosmosHandlerKind,
  CosmosProject,
} from "@subql/types-cosmos";

// Can expand the Datasource processor types via the genreic param
const project: CosmosProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "neutron-starter",
  description:
    "This project can be use as a starting point for developing your Cosmos neutron based SubQuery project",
  runner: {
    node: {
      name: "@subql/node-cosmos",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /* The unique chainID of the Cosmos Zone */
    chainId: "neutron-1",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: [
      "https://rpc-kralum.neutron-1.neutron.org", // Lowest height: 5323785
      "https://rpc-neutron.whispernode.com", // Lowest height: 6302347
      // "https://neutron-rpc.polkachu.com" // Lowest height: 5323785
    ],
  },
  dataSources: [
    {
      kind: CosmosDatasourceKind.Runtime,
      startBlock: 6382048,
      // assets: new Map([["astroportPair", { file: "./schemas/astroport-pair-xyk-sale-tax.json" }]]),
      // options: {
      //   abi: "astroportPair",
      // },
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleSwap",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "wasm",
              attributes: {
                "action": "swap",
                "_contract_address": "neutron169vshmj6x7dlugd32zvwpv6ujwgz80d0l6xt8f5eufkn2dtvhk6s3ulgqv",
              }
            },
          },
        ],
      },
    },
    {
      kind: CosmosDatasourceKind.Runtime,
      startBlock: 6382781,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleSwap",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "wasm",
              attributes: {
                "action": "swap",
                "_contract_address": "neutron1zhjrgpvu2th5t8w5ndfw9lwsqp95sgr46kf4j3jrcfe2lep0hlnqfczpjm",
              }
            },
          },
        ],
      },
    },
    {
      kind: CosmosDatasourceKind.Runtime,
      startBlock: 6390635,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            handler: "handleSwap",
            kind: CosmosHandlerKind.Event,
            filter: {
              type: "wasm",
              // If we enable this then swaps through the router will not be indexed.
              // Not sure how else to filter only "real swaps" and not any event that
              // fakes these attributes? Perhaps just in the handler?
              // messageFilter: {
              //   type: "/cosmwasm.wasm.v1.MsgExecuteContract",
              //   values: {
              //     contract: "neutron15wal8wsy7mq37hagmrzchwmugpjzwlzrlw7pylkhlfuwukmc2kps722ems",
              //   }
              // },
              attributes: {
                "action": "swap",
                "_contract_address": "neutron15wal8wsy7mq37hagmrzchwmugpjzwlzrlw7pylkhlfuwukmc2kps722ems",
              }
            },
          },
        ],
      },
    },
  ],
};

// Must set default to the project instance
export default project;
