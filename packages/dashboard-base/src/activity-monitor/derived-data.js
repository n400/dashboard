export const isBusy = (state) => state.getIn(["activityMonitor", "isBusy"], false)
