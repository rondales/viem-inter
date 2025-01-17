import type { Address } from '../../accounts/index.js'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import type { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import { parseAccount } from '../../utils/accounts.js'
import { TokenIsEthError } from '../errors/token-is-eth.js'
import { isEth } from '../utils/isEth.js'

export type GetL1TokenBalanceParameters<
  TAccount extends Account | undefined = Account | undefined,
> = GetAccountParameter<TAccount> & { token: Address } & (
    | {
        /** The balance of the account at a block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /** The balance of the account at a block tag. */
        blockTag?: BlockTag | undefined
      }
  )

export type GetL1TokenBalanceReturnType = bigint

export type GetL1TokenBalanceErrorType =
  | AccountNotFoundError
  | BaseError
  | TokenIsEthError

export async function getL1TokenBalance<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: GetL1TokenBalanceParameters<TAccount>,
): Promise<GetL1TokenBalanceReturnType> {
  const {
    account: account_ = client.account,
    blockTag,
    blockNumber,
    token,
  } = parameters

  if (isEth(token!)) throw new TokenIsEthError()

  const account = account_ ? parseAccount(account_) : client.account

  return await readContract(client, {
    abi: erc20Abi,
    address: token!,
    functionName: 'balanceOf',
    args: [account!.address],
    blockNumber: blockNumber,
    blockTag: blockTag,
  })
}
