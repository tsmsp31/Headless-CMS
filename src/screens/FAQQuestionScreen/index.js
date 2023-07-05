import Head from "next/head";
import { Footer } from "../../components/commons/Footer";
import { Menu } from "../../components/commons/Menu";
import { Box, Text, theme } from "../../theme/components";
import { cmsService } from "../../infra/cms/cmsService";
import { renderNodeRule, StructuredText } from "react-datocms";
import { isHeading } from "datocms-structured-text-utils";
import { pageHOC } from "../../components/wrappers/pageHOC";
import Image from "next/image";
import { useRouter } from "next/router";
import styled from "styled-components";
import { AiOutlineArrowLeft } from "react-icons/ai";

const StyledText = styled.p`
  cursor: pointer;
  width: ${theme.space.x10};
  color: ${theme.colors.neutral.x500};
  text-align: ${theme.typography.variants.display1.letterSpacing.md};
  font-weight: ${theme.typography.variants.display1.fontWeight.xs};

  &:hover {
    color: ${theme.colors.neutral.x700};
  }
`;

export async function getStaticPaths() {
  const pathsQuery = `
    query($first: IntType, $skip: IntType) {
      allContentFaqQuestions(first: $first, skip: $skip) {
        id
        title
      }
    }
  `;

  const { data } = await cmsService({
    query: pathsQuery,
    variables: {
      first: 100,
      skip: 0,
    },
  });

  const paths = data.allContentFaqQuestions.map(({ id }) => {
    return {
      params: { id },
    };
  });

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params, preview }) {
  const { id } = params;
  const contentQuery = `
  query($id: ItemId) {
    contentFaqQuestion(filter: {id: {eq: $id}}) {
      title
      content {
        value
      }
      coverPostImage {
        url
      }
    }
    contentFaqCategory {
      datePost
      id
    }
  }
  `;

  const { data } = await cmsService({
    query: contentQuery,
    variables: {
      id: id,
    },
    preview,
  });

  return {
    props: {
      cmsContent: data,
      id,
      title: data.contentFaqQuestion.title,
      content: data.contentFaqQuestion.content,
      coverPostImage: data.contentFaqQuestion.coverPostImage,
      contentFaqCategory: data.contentFaqCategory,
    },
  };
}

function FAQQuestionScreen({ cmsContent, coverPostImage, contentFaqCategory }) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>{cmsContent.contentFaqQuestion.title}</title>
      </Head>

      <Menu />

      <Box
        tag="main"
        styleSheet={{
          flex: 1,
          backgroundColor: theme.colors.neutral.x050,
          paddingTop: theme.space.x20,
          paddingHorizontal: theme.space.x4,
        }}
      >
        <Box
          styleSheet={{
            flexDirection: "column",
            width: "100%",
            maxWidth: theme.space.xcontainer_lg,
            marginHorizontal: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StyledText onClick={() => router.back()} style={{ flex: 1 }}>
              <AiOutlineArrowLeft
                style={{ position: "relative", top: "2px" }}
              />
              Back
            </StyledText>
          </div>

          {contentFaqCategory && (
            <Text tag="h2" variant="heading2">
              {contentFaqCategory.datePost}
            </Text>
          )}

          <Text tag="h1" variant="heading1">
            {cmsContent.contentFaqQuestion.title}
          </Text>

          {coverPostImage && coverPostImage.url && (
            <Image
              src={coverPostImage.url}
              alt={cmsContent.contentFaqQuestion.title}
              layout="responsive"
              width={500}
              height={300}
            />
          )}
          <StructuredText
            data={cmsContent.contentFaqQuestion.content}
            customNodeRules={[
              renderNodeRule(isHeading, ({ node, children, key }) => {
                const tag = `h${node.level}`;
                const variant = `heading${node.level}`;
                return (
                  <Text tag={tag} variant={variant} key={key}>
                    {children}
                  </Text>
                );
              }),
            ]}
          />
        </Box>
      </Box>

      <Footer />
    </>
  );
}

export default pageHOC(FAQQuestionScreen);
