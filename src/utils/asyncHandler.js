export { asyncHandler }
//const asyncHandler = (fn) => { () => {} }
const asyncHandler = (requestHandler) => async(req,res,next) => {
try {
    await fn(req,res,next)
}
 catch (error) {
    res.status(err.code || 404 ).json({
        success: false,
        message: err.message
  })}}

   // const asyncHandler=(requestHandler)=>{
    //    (req,res,next) => {
    //     Promise.resolve(requestHandler).
    //     reject((err) => next(err))
    // }}}

