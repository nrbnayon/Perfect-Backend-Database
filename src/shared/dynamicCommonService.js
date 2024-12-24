const isExistUsingCompositKey = async (req,model) => {
    const compositeKey = `p-${product?.productName?.substring(0, 5)}-${
        product?.productPrice
      }`;
      // Check if a product with the same compositeKey exists
      const isExist = await ProductModel.findOne({
        compositeKey: compositeKey,
      });
  
    return newSubCategory;
  };
  

  
const dynamicCommonServices = {
    isExistUsingCompositKey,
  
  };
  module.exports = dynamicCommonServices;
  