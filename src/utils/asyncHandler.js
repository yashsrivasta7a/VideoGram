// controller ko error free
//const asyncHandler = (fn) => { () => {} }
const asyncHandler = (requestHandler) => async(req,res,next) => {  // higher order function - ek function ko as a param and return kr ske
try {
    await requestHandler(req,res,next)
}
 catch (error) {
    res.status(err.code || 404 ).json({
        success: false,
        message: error.message
  })}}

  export { asyncHandler }
   // const asyncHandler=(requestHandler)=>{
    //  return (req,res,next) => {
    //     Promise.resolve(requestHandler).
    //     reject((err) => next(err))
    // }}}

